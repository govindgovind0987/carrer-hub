import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req, { params }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { slug } = await params;

    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        testCases: {
          where: { isHidden: false },
          select: { input: true, expectedOutput: true, explanation: true },
        },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const navigationSelect = {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      category: true,
    };

    // All remaining reads depend only on the problem id and can run concurrently.
    const [prevProblem, nextProblem, sameTopic, sameDifficulty, avgStats, userProgress, submissions] =
      await Promise.all([
      prisma.problem.findFirst({
        where: {
          OR: [
            { createdAt: { lt: problem.createdAt } },
            { createdAt: problem.createdAt, id: { lt: problem.id } },
          ],
        },
        select: navigationSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      prisma.problem.findFirst({
        where: {
          OR: [
            { createdAt: { gt: problem.createdAt } },
            { createdAt: problem.createdAt, id: { gt: problem.id } },
          ],
        },
        select: navigationSelect,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
      prisma.problem.findMany({
        where: { category: problem.category, NOT: { id: problem.id } },
        take: 3,
        select: { id: true, slug: true, title: true, difficulty: true, category: true, acceptanceRate: true },
      }),
      prisma.problem.findMany({
        where: { difficulty: problem.difficulty, NOT: { id: problem.id } },
        take: 3,
        select: { id: true, slug: true, title: true, difficulty: true, category: true, acceptanceRate: true },
      }),
      prisma.problemSubmission.aggregate({
        where: { problemId: problem.id, verdict: 'ACCEPTED' },
        _avg: { runtimeMs: true, memoryMb: true },
      }),
      userId
        ? prisma.userProblemProgress.findUnique({
            where: { userId_problemId: { userId, problemId: problem.id } },
            select: { status: true, bookmarked: true, savedCode: true, lastSubmittedAt: true },
          })
        : null,
      userId
        ? prisma.problemSubmission.findMany({
            where: { userId, problemId: problem.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
              id: true,
              verdict: true,
              language: true,
              code: true,
              runtimeMs: true,
              memoryMb: true,
              passedCases: true,
              totalCases: true,
              createdAt: true,
            },
          })
        : [],
    ]);

    const averageRuntimeMs = Math.round(avgStats._avg.runtimeMs || 42);
    const averageMemoryMb = Math.round((avgStats._avg.memoryMb || 14.5) * 10) / 10;

    // Hide reference solution from candidate editor API response
    const { referenceSolution, ...safeProblem } = problem;

    return NextResponse.json({
      problem: {
        ...safeProblem,
        averageRuntimeMs,
        averageMemoryMb,
      },
      similarProblems: {
        sameTopic,
        sameDifficulty,
        recommendedNext: nextProblem,
        prevSlug: prevProblem?.slug || null,
        nextSlug: nextProblem?.slug || null,
      },
      userProgress,
      submissions,
    });
  } catch (error) {
    console.error('Fetch Problem Detail Error:', error);
    return NextResponse.json({ error: 'Failed to fetch problem detail' }, { status: 500 });
  }
}
