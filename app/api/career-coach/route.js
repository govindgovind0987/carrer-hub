import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCareerCoachResponseWithAI, normalizeActionType } from '@/services/ai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    
    const canonicalAction = normalizeActionType(body.actionType);
    if (!canonicalAction) {
      return NextResponse.json(
        { error: `Invalid actionType provided: "${body.actionType}". Must be one of the supported 9 Career Coach actions.` },
        { status: 400 }
      );
    }

    // Fetch complete authenticated candidate context from DB
    const [
      profile,
      resumeCount,
      latestAnalysis,
      codingStats,
      userProgress,
      recentSubmissions,
      mockSessions,
      interviewReports,
    ] = await Promise.all([
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
      prisma.userProblemProgress.findMany({
        where: { userId },
        include: { problem: true },
      }),
      prisma.problemSubmission.findMany({
        where: { userId },
        include: { problem: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.interviewSession.findMany({
        where: { userId },
        include: { report: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.interviewReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Topic frequency and weak topics calculation
    const topicCounts = {};
    const topicFailures = {};

    recentSubmissions.forEach((sub) => {
      const category = sub.problem?.category || 'General';
      topicCounts[category] = (topicCounts[category] || 0) + 1;
      if (sub.verdict !== 'ACCEPTED') {
        topicFailures[category] = (topicFailures[category] || 0) + 1;
      }
    });

    const topPracticedTopics = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);
    const weakTopics = Object.keys(topicFailures).filter((topic) => topicFailures[topic] >= 2);

    const avgInterviewScore =
      interviewReports.length > 0
        ? Math.round(interviewReports.reduce((acc, r) => acc + r.overallScore, 0) / interviewReports.length)
        : null;

    const interviewStrengths = Array.from(new Set(interviewReports.flatMap((r) => r.strengths || [])));
    const interviewWeaknesses = Array.from(new Set(interviewReports.flatMap((r) => r.weaknesses || [])));

    const experiencesSummary = profile?.experiences?.map((e) => `${e.title} at ${e.company}`).join('; ') || '';
    const projectsSummary = profile?.projects?.map((p) => `${p.title}: ${p.description || ''}`).join('; ') || '';
    const educationsSummary = profile?.educations?.map((ed) => `${ed.degree} in ${ed.fieldOfStudy} from ${ed.institution}`).join('; ') || '';

    const userContext = {
      name: session.user.name,
      headline: profile?.headline,
      bio: profile?.bio,
      profileSkills: profile?.skills?.map((s) => s.name) || [],
      experiencesSummary,
      projectsSummary,
      educationsSummary,
      resumeCount,
      atsScore: latestAnalysis?.atsScore ?? null,
      overallScore: latestAnalysis?.overallScore ?? null,
      weakAreas: latestAnalysis?.weakAreas || [],
      missingSkills: latestAnalysis?.missingSkills || [],
      solvedCount: codingStats?.solvedCount || 0,
      easySolved: codingStats?.easySolved || 0,
      mediumSolved: codingStats?.mediumSolved || 0,
      hardSolved: codingStats?.hardSolved || 0,
      totalSubmissions: codingStats?.totalSubmissions || 0,
      topPracticedTopics,
      weakTopics,
      mockSessionsCount: mockSessions.length,
      avgInterviewScore,
      interviewStrengths,
      interviewWeaknesses,
    };

    const aiResponse = await generateCareerCoachResponseWithAI(canonicalAction, userContext);
    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('Error in AI Career Coach API:', error);
    return NextResponse.json({ error: 'Failed to generate AI advice' }, { status: 500 });
  }
}

