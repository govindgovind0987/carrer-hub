import { prisma } from '@/lib/prisma';

/**
 * Reusable database helper functions for common operations.
 * These wrap Prisma calls with consistent error handling and patterns.
 */

/**
 * Find a user by their ID with optional includes.
 * @param {string} id
 * @param {object} [include] - Prisma include options
 */
export async function findUserById(id, include = {}) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include,
    });
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

/**
 * Find a user by their email with optional includes.
 * @param {string} email
 * @param {object} [include] - Prisma include options
 */
export async function findUserByEmail(email, include = {}) {
  try {
    return await prisma.user.findUnique({
      where: { email },
      include,
    });
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

/**
 * Get a user profile by userId.
 * @param {string} userId
 */
export async function getUserProfile(userId) {
  try {
    return await prisma.profile.findUnique({
      where: { userId },
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update a user profile by userId.
 * @param {string} userId
 * @param {object} data - Profile data to update
 */
export async function updateUserProfile(userId, data) {
  try {
    return await prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Paginated query helper.
 * @param {string} model - Prisma model name
 * @param {object} options - Query options
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.pageSize - Items per page
 * @param {object} [options.where] - Prisma where clause
 * @param {object} [options.orderBy] - Prisma orderBy clause
 * @param {object} [options.include] - Prisma include clause
 */
export async function paginatedQuery(
  model,
  { page = 1, pageSize = 10, where = {}, orderBy = {}, include = {} }
) {
  try {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      prisma[model].findMany({
        where,
        orderBy,
        include,
        skip,
        take: pageSize,
      }),
      prisma[model].count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error(`Error in paginated query for ${model}:`, error);
    throw error;
  }
}
