import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CareerCoachClient from './career-coach-client';

export const metadata = {
  title: 'AI Career Coach | CareerHub',
  description: 'Personalized AI career advisor powered by Groq SDK analyzing your actual profile, DSA progress, and interview performance.',
};

export const dynamic = 'force-dynamic';

export default async function CareerCoachPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Please sign in to access your AI Career Coach.</p>
      </div>
    );
  }

  // Fetch candidate complete database metrics
  const [profile, resumeCount, latestAnalysis, codingStats, mockSessions, interviewReports] =
    await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
        include: { skills: true, experiences: true, educations: true, projects: true },
      }),
      prisma.resume.count({ where: { userId } }),
      prisma.resumeAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userCodingStats.findUnique({ where: { userId } }),
      prisma.interviewSession.findMany({
        where: { userId },
      }),
      prisma.interviewReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

  // Calculate Profile Strength (0-100)
  let profileStrength = 20;
  if (profile?.headline) profileStrength += 15;
  if (profile?.bio) profileStrength += 15;
  if (profile?.skills?.length > 0) profileStrength += 15;
  if (profile?.experiences?.length > 0) profileStrength += 15;
  if (profile?.educations?.length > 0) profileStrength += 10;
  if (profile?.projects?.length > 0) profileStrength += 10;
  profileStrength = Math.min(100, profileStrength);

  // Resume Readiness (0-100)
  const resumeReadiness = latestAnalysis?.atsScore ?? (resumeCount > 0 ? 50 : 0);

  // DSA Readiness (0-100) based on solved problems
  const solvedCount = codingStats?.solvedCount || 0;
  const dsaReadiness = Math.min(100, Math.round((solvedCount / 20) * 100));

  // Technical Readiness (combination of DSA + Skills)
  const skillCount = profile?.skills?.length || 0;
  const technicalReadiness = Math.min(100, Math.round(dsaReadiness * 0.6 + Math.min(40, skillCount * 8)));

  // Interview Readiness (0-100)
  const avgMock =
    interviewReports.length > 0
      ? Math.round(interviewReports.reduce((acc, r) => acc + r.overallScore, 0) / interviewReports.length)
      : mockSessions.length > 0
      ? 40
      : 0;
  const interviewReadiness = avgMock;

  // Overall Career Readiness Score
  const careerReadinessScore = Math.round(
    profileStrength * 0.2 + resumeReadiness * 0.25 + technicalReadiness * 0.25 + interviewReadiness * 0.3
  );

  const initialContext = {
    userName: session.user.name || 'Candidate',
    headline: profile?.headline || 'Software Engineer',
    profileStrength,
    resumeReadiness,
    technicalReadiness,
    dsaReadiness,
    interviewReadiness,
    careerReadinessScore,
    solvedCount,
    resumeCount,
    atsScore: latestAnalysis?.atsScore ?? null,
    mockCount: mockSessions.length,
  };

  return <CareerCoachClient initialContext={initialContext} />;
}
