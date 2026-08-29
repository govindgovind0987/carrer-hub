import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SkillProgressClient from './skill-progress-client';

export const metadata = {
  title: 'Skill Progress Dashboard | CareerHub',
  description: 'Interactive breakdown of your technical mastery across 20 DSA topics, web dev, database, and interview prep.',
};

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
        include: { problem: true },
      }),
      prisma.problemSubmission.findMany({
        where: { userId },
        include: { problem: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userCodingStats.findUnique({ where: { userId } }),
      prisma.interviewSession.findMany({
        where: { userId },
        include: { report: true },
      }),
      prisma.resumeAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.profile.findUnique({
        where: { userId },
        include: { skills: true },
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
