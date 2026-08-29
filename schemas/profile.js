import { z } from 'zod';

export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  headline: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid URL').or(z.literal('')).optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional(),
  githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')).optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(2, 'Institution is required'),
  degree: z.string().min(2, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export const experienceSchema = z.object({
  company: z.string().min(2, 'Company name is required'),
  title: z.string().min(2, 'Job title is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().default('General'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('INTERMEDIATE'),
});

export const projectSchema = z.object({
  title: z.string().min(2, 'Project title is required'),
  description: z.string().min(5, 'Description is required'),
  link: z.string().url('Invalid URL').or(z.literal('')).optional(),
  githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')).optional(),
  technologies: z.string().or(z.array(z.string())).optional(),
});

export const certificateSchema = z.object({
  name: z.string().min(2, 'Certificate name is required'),
  issuer: z.string().min(2, 'Issuer is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  credentialUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  credentialId: z.string().optional(),
});

export const languageSchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  proficiency: z.string().default('Professional'),
});

export const achievementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
});
