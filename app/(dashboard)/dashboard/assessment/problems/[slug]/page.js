import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { LeetCodeWorkspace } from '@/components/assessment/v2/leetcode-workspace';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const problem = await prisma.problem.findUnique({ where: { slug } });
  if (!problem) return { title: 'Problem Not Found' };
  return {
    title: `${problem.title} | CareerHub Coding Platform`,
    description: problem.description.slice(0, 150),
  };
}

export default async function ProblemWorkspacePage({ params }) {
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
    notFound();
  }

  let userProgress = null;
  let previousSubmissions = [];

  if (userId) {
    userProgress = await prisma.userProblemProgress.findUnique({
      where: { userId_problemId: { userId, problemId: problem.id } },
    });

    previousSubmissions = await prisma.problemSubmission.findMany({
      where: { userId, problemId: problem.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        verdict: true,
        language: true,
        runtimeMs: true,
        memoryMb: true,
        code: true,
        passedCases: true,
        totalCases: true,
        createdAt: true,
      },
    });
  }

  return (
    <LeetCodeWorkspace
      problem={problem}
      userProgress={userProgress}
      previousSubmissions={previousSubmissions}
    />
  );
}
