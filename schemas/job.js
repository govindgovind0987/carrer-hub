import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  category: z.string().min(2, 'Category is required'),
  location: z.string().min(2, 'Location is required'),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE', 'HYBRID']).default('FULL_TIME'),
  experienceLevel: z.enum(['ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'LEAD', 'EXECUTIVE']).default('MID_LEVEL'),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  salaryCurrency: z.string().default('USD'),
  description: z.string().min(20, 'Job description must be at least 20 characters'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).default('PUBLISHED'),
});

export const applicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  resumeId: z.string().optional(),
  coverLetter: z.string().optional(),
});
