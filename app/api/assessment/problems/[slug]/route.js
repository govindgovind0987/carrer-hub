import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // 1. Fetch Similar & Navigation Problems
    const [allProblems, sameTopic, sameDifficulty] = await Promise.all([
      prisma.problem.findMany({
        select: { id: true, slug: true, title: true, difficulty: true, category: true },
        orderBy: { createdAt: 'asc' },
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
    ]);

    const currentIndex = allProblems.findIndex((p) => p.id === problem.id);
    const prevProblem = currentIndex > 0 ? allProblems[currentIndex - 1] : null;
    const nextProblem = currentIndex < allProblems.length - 1 ? allProblems[currentIndex + 1] : null;

    // 2. Compute Average Metrics for Problem
    const avgStats = await prisma.problemSubmission.aggregate({
      where: { problemId: problem.id, verdict: 'ACCEPTED' },
      _avg: { runtimeMs: true, memoryMb: true },
    });

    const averageRuntimeMs = Math.round(avgStats._avg.runtimeMs || 42);
    const averageMemoryMb = Math.round((avgStats._avg.memoryMb || 14.5) * 10) / 10;

    let userProgress = null;
    let submissions = [];

    if (userId) {
      userProgress = await prisma.userProblemProgress.findUnique({
        where: { userId_problemId: { userId, problemId: problem.id } },
      });

      submissions = await prisma.problemSubmission.findMany({
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
      });
    }

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
