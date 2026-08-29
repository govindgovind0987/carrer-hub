'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { deleteFile } from '@/services/storage';


export async function getResumes() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, resumes };
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return { success: false, error: 'Failed to fetch resumes' };
  }
}

export async function createResume({ title, fileUrl, fileKey, fileSize, mimeType }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    if (!title || !fileUrl) {
      return { success: false, error: 'Title and File URL are required' };
    }

    // Check if user has existing resumes
    const existingCount = await prisma.resume.count({
      where: { userId: session.user.id },
    });

    // Create main resume entry
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title,
        fileUrl,
        fileKey: fileKey || null,
        fileSize: fileSize || 0,
        mimeType: mimeType || 'application/pdf',
        isDefault: existingCount === 0, // Make default if first resume
        versions: {
          create: {
            versionNumber: 1,
            fileUrl,
            fileKey: fileKey || null,
            changesDescription: 'Initial upload',
          },
        },
      },
      include: { versions: true },
    });

    // Update profile.resumeUrl if default
    if (resume.isDefault) {
      await prisma.profile.upsert({
        where: { userId: session.user.id },
        update: { resumeUrl: fileUrl },
        create: { userId: session.user.id, resumeUrl: fileUrl },
      });
    }

    revalidatePath('/dashboard/resumes');
    revalidatePath('/dashboard/profile');
    return { success: true, resume };
  } catch (error) {
    console.error('Error creating resume:', error);
    return { success: false, error: 'Failed to create resume' };
  }
}

export async function setDefaultResume(resumeId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    // Reset all default resumes for user
    await prisma.resume.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });

    // Set selected as default
    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: { isDefault: true },
    });

    // Sync profile resumeUrl
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { resumeUrl: updated.fileUrl },
      create: { userId: session.user.id, resumeUrl: updated.fileUrl },
    });

    revalidatePath('/dashboard/resumes');
    revalidatePath('/dashboard/profile');
    return { success: true, resume: updated };
  } catch (error) {
    console.error('Error setting default resume:', error);
    return { success: false, error: 'Failed to set default resume' };
  }
}

export async function deleteResume(resumeId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { fileKey: true },
    });

    if (resume?.fileKey) {
      await deleteFile(resume.fileKey, 'raw');
    }

    await prisma.resume.delete({ where: { id: resumeId } });

    revalidatePath('/dashboard/resumes');
    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (error) {
    console.error('Error deleting resume:', error);
    return { success: false, error: 'Failed to delete resume' };
  }
}


export async function createResumeVersion(resumeId, { fileUrl, fileKey, changesDescription }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: { versions: true },
    });

    if (!resume) return { success: false, error: 'Resume not found' };

    const nextVersionNumber = (resume.versions?.length || 0) + 1;

    const version = await prisma.resumeVersion.create({
      data: {
        resumeId,
        versionNumber: nextVersionNumber,
        fileUrl,
        fileKey: fileKey || null,
        changesDescription: changesDescription || `Version ${nextVersionNumber}`,
      },
    });

    // Update main resume fileUrl to latest
    await prisma.resume.update({
      where: { id: resumeId },
      data: { fileUrl },
    });

    revalidatePath('/dashboard/resumes');
    return { success: true, version };
  } catch (error) {
    console.error('Error creating resume version:', error);
    return { success: false, error: 'Failed to add version' };
  }
}
