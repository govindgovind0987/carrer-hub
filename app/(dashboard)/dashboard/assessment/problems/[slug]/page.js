import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { LeetCodeWorkspace } from '@/components/assessment/v2/leetcode-workspace';
import { cache } from 'react';

const getProblem = cache((slug) =>
  prisma.problem.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      difficulty: true,
      category: true,
      tags: true,
      constraints: true,
      examples: true,
      hints: true,
      editorial: true,
      starterCode: true,
      referenceSolution: true,
      companyTags: true,
      complexityAnalysis: true,
      timeLimitMs: true,
      memoryLimitMb: true,
      supportedLanguages: true,
      totalSubmissions: true,
      acceptedSubmissions: true,
      acceptanceRate: true,
      testCases: {
        where: { isHidden: false },
        select: { input: true, expectedOutput: true, explanation: true },
      },
    },
  })
);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const problem = await getProblem(slug);
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

  const problem = await getProblem(slug);

  if (!problem) {
    notFound();
  }

  const [userProgress, previousSubmissions] = userId
    ? await Promise.all([
        prisma.userProblemProgress.findUnique({
          where: { userId_problemId: { userId, problemId: problem.id } },
          select: { bookmarked: true },
        }),
        prisma.problemSubmission.findMany({
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
        }),
      ])
    : [null, []];

  return (
    <LeetCodeWorkspace
      problem={problem}
      userProgress={userProgress}
      previousSubmissions={previousSubmissions}
    />
  );
}
