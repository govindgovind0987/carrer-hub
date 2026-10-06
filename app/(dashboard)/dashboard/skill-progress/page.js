import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SkillProgressClient from './skill-progress-client';

export const metadata = {
  title: 'Skill Progress Dashboard | CareerHub',
  description: 'Interactive breakdown of your technical mastery across 20 DSA topics, web dev, database, and interview prep.',
};

export const dynamic = 'force-dynamic';

export default async function SkillProgressPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Please sign in to view your skill progress dashboard.</p>
      </div>
    );
  }

  // Fetch candidate authentic submissions and progress
  const [userProgress, submissions, codingStats, interviewSessions, latestAnalysis, profile] =
    await Promise.all([
      prisma.userProblemProgress.findMany({
        where: { userId },
        select: {
          status: true,
          lastSubmittedAt: true,
          problem: { select: { category: true, tags: true, difficulty: true } },
        },
      }),
      prisma.problemSubmission.findMany({
        where: { userId },
        select: {
          verdict: true,
          language: true,
          createdAt: true,
          problem: { select: { category: true, tags: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.userCodingStats.findUnique({ where: { userId }, select: { solvedCount: true } }),
      prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          role: true,
          technology: true,
          type: true,
          status: true,
          report: { select: { overallScore: true } },
        },
      }),
      prisma.resumeAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { atsScore: true, overallScore: true, missingSkills: true },
      }),
      prisma.profile.findUnique({
        where: { userId },
        select: { skills: { select: { id: true, name: true, level: true } } },
      }),
    ]);

  return (
    <SkillProgressClient
      userProgress={userProgress}
      submissions={submissions}
      codingStats={codingStats}
      interviewSessions={interviewSessions}
      latestAnalysis={latestAnalysis}
      profile={profile}
    />
  );
}
