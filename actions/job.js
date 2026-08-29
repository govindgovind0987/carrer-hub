'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { jobSchema, applicationSchema } from '@/schemas/job';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/utils';

/**
 * Get all published jobs with search & filters
 */
export async function getJobs(filters = {}) {
  try {
    const {
      search = '',
      category = '',
      location = '',
      jobType = '',
      experienceLevel = '',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where = {
      status: 'PUBLISHED',
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { company: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(category && { category: { equals: category, mode: 'insensitive' } }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(jobType && { jobType }),
      ...(experienceLevel && { experienceLevel }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: { name: true, logo: true, location: true, industry: true },
          },
        },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      success: true,
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return { success: false, jobs: [], total: 0, totalPages: 1 };
  }
}

/**
 * Get Single Job by Slug or ID
 */
export async function getJobBySlug(slug) {
  try {
    const job = await prisma.job.findUnique({
      where: { slug },
      include: {
        company: true,
        recruiter: { select: { name: true, email: true, image: true } },
      },
    });

    if (job) {
      // Increment views count asynchronously
      await prisma.job.update({
        where: { id: job.id },
        data: { viewsCount: { increment: 1 } },
      }).catch(() => {});
    }

    return { success: true, job };
  } catch (error) {
    console.error('Error fetching job by slug:', error);
    return { success: false, error: 'Job not found' };
  }
}

/**
 * Recruiter: Create Job
 */
export async function createJob(formData) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
      return { success: false, error: 'Only recruiters can post jobs' };
    }

    const validated = jobSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message };
    }

    // Ensure Recruiter has a Company entry
    let company = await prisma.company.findUnique({
      where: { recruiterId: session.user.id },
    });

    if (!company) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      const companyName = user?.name ? `${user.name}'s Company` : 'Hiring Company';
      company = await prisma.company.create({
        data: {
          recruiterId: session.user.id,
          name: companyName,
          slug: slugify(`${companyName}-${Date.now().toString().slice(-4)}`),
        },
      });
    }

    const baseSlug = slugify(validated.data.title);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        recruiterId: session.user.id,
        title: validated.data.title,
        slug: uniqueSlug,
        category: validated.data.category,
        location: validated.data.location,
        jobType: validated.data.jobType,
        experienceLevel: validated.data.experienceLevel,
        salaryMin: validated.data.salaryMin || null,
        salaryMax: validated.data.salaryMax || null,
        salaryCurrency: validated.data.salaryCurrency || 'USD',
        description: validated.data.description,
        requirements: validated.data.requirements,
        status: validated.data.status || 'PUBLISHED',
      },
    });

    revalidatePath('/jobs');
    revalidatePath('/dashboard/jobs');
    return { success: true, job };
  } catch (error) {
    console.error('Error creating job:', error);
    return { success: false, error: 'Failed to create job' };
  }
}

/**
 * Recruiter: Update Job
 */
export async function updateJob(jobId, formData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = jobSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message };
    }

    const job = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: validated.data.title,
        category: validated.data.category,
        location: validated.data.location,
        jobType: validated.data.jobType,
        experienceLevel: validated.data.experienceLevel,
        salaryMin: validated.data.salaryMin || null,
        salaryMax: validated.data.salaryMax || null,
        salaryCurrency: validated.data.salaryCurrency || 'USD',
        description: validated.data.description,
        requirements: validated.data.requirements,
        status: validated.data.status,
      },
    });

    revalidatePath('/jobs');
    revalidatePath('/dashboard/jobs');
    return { success: true, job };
  } catch (error) {
    console.error('Error updating job:', error);
    return { success: false, error: 'Failed to update job' };
  }
}

/**
 * Recruiter: Delete Job
 */
export async function deleteJob(jobId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await prisma.job.delete({ where: { id: jobId } });
    revalidatePath('/jobs');
    revalidatePath('/dashboard/jobs');
    return { success: true };
  } catch (error) {
    console.error('Error deleting job:', error);
    return { success: false, error: 'Failed to delete job' };
  }
}

/**
 * Bookmark / Unbookmark Job
 */
export async function toggleBookmarkJob(jobId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      revalidatePath('/jobs');
      revalidatePath('/dashboard/bookmarks');
      return { success: true, isBookmarked: false };
    } else {
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          jobId,
        },
      });
      revalidatePath('/jobs');
      revalidatePath('/dashboard/bookmarks');
      return { success: true, isBookmarked: true };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return { success: false, error: 'Failed to toggle bookmark' };
  }
}

/**
 * Apply to Job
 */
export async function applyToJob(formData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = applicationSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message };
    }

    const { jobId, resumeId, coverLetter } = validated.data;

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: session.user.id,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'You have already applied to this job' };
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: session.user.id,
        resumeId: resumeId || null,
        coverLetter: coverLetter || null,
        status: 'PENDING',
      },
    });

    revalidatePath('/jobs');
    revalidatePath('/dashboard/applications');
    return { success: true, application };
  } catch (error) {
    console.error('Error applying to job:', error);
    return { success: false, error: 'Failed to submit application' };
  }
}

/**
 * Candidate: Withdraw Application
 */
export async function withdrawApplication(applicationId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await prisma.application.delete({ where: { id: applicationId } });
    revalidatePath('/dashboard/applications');
    return { success: true };
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return { success: false, error: 'Failed to withdraw application' };
  }
}

/**
 * Recruiter: Update Application Status
 */
export async function updateApplicationStatus(applicationId, status) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    revalidatePath('/dashboard/applications');
    revalidatePath('/dashboard/recruiter');
    return { success: true, application };
  } catch (error) {
    console.error('Error updating application status:', error);
    return { success: false, error: 'Failed to update application status' };
  }
}
