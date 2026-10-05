import { prisma } from '@/lib/prisma';

/**
 * Fetch a paginated list of assessment problems with database-level filtering
 * and user progress indicators.
 *
 * Supports offset-based (page) and cursor-based (cursor) pagination.
 *
 * @param {Object} params
 * @param {string} [params.category='ALL'] - DSA Topic category
 * @param {string} [params.difficulty='ALL'] - EASY, MEDIUM, or HARD
 * @param {string} [params.company='ALL'] - Company tag
 * @param {string} [params.search=''] - Free text search on title, description, tags, companies
 * @param {string} [params.tag=''] - Specific tag filter
 * @param {string} [params.status='ALL'] - ALL, SOLVED, ATTEMPTED, UNSOLVED
 * @param {boolean|string} [params.bookmarked=false] - Only show bookmarked problems
 * @param {string|null} [params.userId=null] - Current user ID for progress and bookmark checks
 * @param {number} [params.page=1] - Page number (1-based)
 * @param {number} [params.limit=20] - Number of items to return per page
 * @param {string|null} [params.cursor=null] - ID cursor of last item for cursor-based pagination
 */
export async function getAssessmentProblems({
  category = 'ALL',
  difficulty = 'ALL',
  company = 'ALL',
  search = '',
  tag = '',
  status = 'ALL',
  bookmarked = false,
  userId = null,
  page = 1,
  limit = 20,
  cursor = null,
} = {}) {
  const safeLimit =
    Number.isFinite(Number(limit)) && Number(limit) > 0
      ? Math.min(Number(limit), 100)
      : 20;
  const safePage =
    Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const isBookmarked = bookmarked === true || bookmarked === 'true';

  const AND = [];

  if (category && category !== 'ALL') {
    AND.push({
      OR: [
        { category: { equals: category, mode: 'insensitive' } },
        { tags: { has: category } },
      ],
    });
  }

  if (company && company !== 'ALL') {
    AND.push({
      companyTags: { has: company },
    });
  }

  if (difficulty && difficulty !== 'ALL') {
    AND.push({ difficulty });
  }

  if (tag) {
    AND.push({ tags: { has: tag } });
  }

  if (search && search.trim()) {
    const q = search.trim();
    AND.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
        { companyTags: { has: q } },
      ],
    });
  }

  if (isBookmarked) {
    if (!userId) {
      AND.push({ id: '__none__' });
    } else {
      AND.push({
        userProgress: {
          some: {
            userId,
            bookmarked: true,
          },
        },
      });
    }
  }

  if (status && status !== 'ALL') {
    if (status === 'SOLVED') {
      if (!userId) {
        AND.push({ id: '__none__' });
      } else {
        AND.push({
          userProgress: {
            some: {
              userId,
              status: 'SOLVED',
            },
          },
        });
      }
    } else if (status === 'ATTEMPTED') {
      if (!userId) {
        AND.push({ id: '__none__' });
      } else {
        AND.push({
          userProgress: {
            some: {
              userId,
              status: 'ATTEMPTED',
            },
          },
        });
      }
    } else if (status === 'UNSOLVED') {
      if (userId) {
        AND.push({
          OR: [
            { userProgress: { none: { userId } } },
            { userProgress: { some: { userId, status: 'UNSOLVED' } } },
          ],
        });
      }
      // If no userId, all problems are unsolved by definition
    }
  }

  const where = AND.length > 0 ? { AND } : {};

  const paginationQuery = cursor
    ? {
        cursor: { id: cursor },
        skip: 1,
      }
    : {
        skip: (safePage - 1) * safeLimit,
      };

  const select = {
    id: true,
    slug: true,
    title: true,
    difficulty: true,
    category: true,
    tags: true,
    companyTags: true,
    acceptanceRate: true,
    totalSubmissions: true,
    createdAt: true,
    ...(userId
      ? {
          userProgress: {
            where: { userId },
            select: { status: true, bookmarked: true },
            take: 1,
          },
        }
      : {}),
  };

  const [rawProblems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select,
      take: safeLimit,
      ...paginationQuery,
    }),
    prisma.problem.count({ where }),
  ]);

  const problems = rawProblems.map((p) => {
    const up = p.userProgress?.[0];
    const { userProgress, ...rest } = p;
    return {
      ...rest,
      userStatus: up?.status || 'UNSOLVED',
      bookmarked: Boolean(up?.bookmarked),
    };
  });

  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const hasMore = cursor
    ? problems.length === safeLimit
    : safePage < totalPages;
  const nextCursor =
    problems.length > 0 ? problems[problems.length - 1].id : null;

  return {
    problems,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasMore,
      nextCursor,
    },
  };
}
