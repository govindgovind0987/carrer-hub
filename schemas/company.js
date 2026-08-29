import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().optional(),
  website: z.string().url('Invalid website URL').or(z.literal('')).optional(),
  location: z.string().optional(),
  size: z.string().optional(),
  industry: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
});
