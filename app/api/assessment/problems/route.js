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
    const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '100', 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 100;
    const skip = (page - 1) * limit;

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

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
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
        skip,
        take: limit,
      }),
      prisma.problem.count({ where }),
    ]);

    let userProgressMap = {};
    if (userId) {
      const userProgressList = await prisma.userProblemProgress.findMany({
        where: { userId, problemId: { in: problems.map((problem) => problem.id) } },
        select: { problemId: true, status: true },
      });
      userProgressList.forEach((up) => {
        userProgressMap[up.problemId] = up.status;
      });
    }

    const formattedProblems = problems.map((p) => ({
      ...p,
      userStatus: userProgressMap[p.id] || 'UNSOLVED',
    }));

    return NextResponse.json({
      problems: formattedProblems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Fetch Problems Error:', error);
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
  }
}
