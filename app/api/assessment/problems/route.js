import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    const where = {};
    if (category && category !== 'ALL') {
      where.OR = [
        { category: { equals: category, mode: 'insensitive' } },
        { tags: { has: category } },
      ];
    }
    if (difficulty && difficulty !== 'ALL') where.difficulty = difficulty;
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { companyTags: { has: search } },
      ];
    }

    const problems = await prisma.problem.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        category: true,
        tags: true,
        companyTags: true,
        acceptanceRate: true,
        totalSubmissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let userProgressMap = {};
    if (userId) {
      const userProgressList = await prisma.userProblemProgress.findMany({
        where: { userId },
      });
      userProgressList.forEach((up) => {
        userProgressMap[up.problemId] = up.status;
      });
    }

    const formattedProblems = problems.map((p) => ({
      ...p,
      userStatus: userProgressMap[p.id] || 'UNSOLVED',
    }));

    return NextResponse.json({ problems: formattedProblems });
  } catch (error) {
    console.error('Fetch Problems Error:', error);
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
  }
}
