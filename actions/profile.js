'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  personalInfoSchema,
  educationSchema,
  experienceSchema,
  skillSchema,
  projectSchema,
  certificateSchema,
  languageSchema,
  achievementSchema,
} from '@/schemas/profile';
import { revalidatePath } from 'next/cache';

/**
 * Get current user profile with all relations
 */
export async function getProfile() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        educations: { orderBy: { startDate: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        skills: { orderBy: { createdAt: 'desc' } },
        projects: { orderBy: { createdAt: 'desc' } },
        certificates: { orderBy: { issueDate: 'desc' } },
        languages: { orderBy: { createdAt: 'desc' } },
        achievements: { orderBy: { date: 'desc' } },
        user: { select: { name: true, email: true, image: true, role: true } },
      },
    });

    if (!profile) {
      // Upsert default profile if none exists
      const newProfile = await prisma.profile.create({
        data: { userId: session.user.id },
        include: {
          educations: true,
          experiences: true,
          skills: true,
          projects: true,
          certificates: true,
          languages: true,
          achievements: true,
          user: { select: { name: true, email: true, image: true, role: true } },
        },
      });
      return { success: true, profile: newProfile };
    }

    return { success: true, profile };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { success: false, error: 'Failed to fetch profile' };
  }
}

/**
 * Update Personal Info
 */
export async function updatePersonalInfo(formData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = personalInfoSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'Validation failed',
      };
    }

    const { name, headline, bio, phone, location, website, linkedinUrl, githubUrl } =
      validated.data;

    // Update User name
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    // Update Profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        headline,
        bio,
        phone,
        location,
        website,
        linkedinUrl,
        githubUrl,
      },
      create: {
        userId: session.user.id,
        headline,
        bio,
        phone,
        location,
        website,
        linkedinUrl,
        githubUrl,
      },
    });

    revalidatePath('/dashboard/profile');
    return { success: true, profile };
  } catch (error) {
    console.error('Error updating personal info:', error);
    return { success: false, error: 'Failed to update personal info' };
  }
}

/**
 * Education CRUD
 */
export async function addEducation(formData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = educationSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message };
    }

    let profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    if (!profile) {
      profile = await prisma.profile.create({ data: { userId: session.user.id } });
    }

    const education = await prisma.education.create({
      data: {
        profileId: profile.id,
        institution: validated.data.institution,
        degree: validated.data.degree,
        fieldOfStudy: validated.data.fieldOfStudy || null,
        startDate: new Date(validated.data.startDate),
        endDate: validated.data.endDate ? new Date(validated.data.endDate) : null,
        current: validated.data.current,
        description: validated.data.description || null,
      },
    });

    revalidatePath('/dashboard/profile');
    return { success: true, education };
  } catch (error) {
    console.error('Error adding education:', error);
    return { success: false, error: 'Failed to add education' };
  }
}

export async function deleteEducation(id) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await prisma.education.delete({ where: { id } });
    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (error) {
    console.error('Error deleting education:', error);
    return { success: false, error: 'Failed to delete education' };
  }
}

/**
 * Experience CRUD
 */
export async function addExperience(formData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = experienceSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message };
    }

    let profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    if (!profile) {
      profile = await prisma.profile.create({ data: { userId: session.user.id } });
    }

    const experience = await prisma.experience.create({
      data: {
        profileId: profile.id,
        company: validated.data.company,
        title: validated.data.title,
        location: validated.data.location || null,
        startDate: new Date(validated.data.startDate),
        endDate: validated.data.endDate ? new Date(validated.data.endDate) : null,
        current: validated.data.current,
        description: validated.data.description || null,
      },
    });

    revalidatePath('/dashboard/profile');
    return { success: true, experience };
  } catch (error) {
    console.error('Error adding experience:', error);
    return { success: false, error: 'Failed to add experience' };
  }
}

export async function deleteExperience(id) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await prisma.experience.delete({ where: { id } });
    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (error) {
    console.error('Error deleting experience:', error);
    return { success: false, error: 'Failed to delete experience' };
  }
}

/**
 * Skill CRUD
 */
export async function addSkill(formData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = skillSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message };
    }

    let profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    if (!profile) {
      profile = await prisma.profile.create({ data: { userId: session.user.id } });
    }

    const skill = await prisma.skill.create({
      data: {
        profileId: profile.id,
        name: validated.data.name,
        category: validated.data.category || 'General',
        level: validated.data.level,
      },
    });

    revalidatePath('/dashboard/profile');
    return { success: true, skill };
  } catch (error) {
    console.error('Error adding skill:', error);
    return { success: false, error: 'Failed to add skill' };
  }
}

export async function deleteSkill(id) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await prisma.skill.delete({ where: { id } });
    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (error) {
    console.error('Error deleting skill:', error);
    return { success: false, error: 'Failed to delete skill' };
  }
}

/**
 * Project CRUD
 */
export async function addProject(formData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = projectSchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message };
    }

    let profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    if (!profile) {
      profile = await prisma.profile.create({ data: { userId: session.user.id } });
    }

    const techs = typeof validated.data.technologies === 'string'
      ? validated.data.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : Array.isArray(validated.data.technologies) ? validated.data.technologies : [];

    const project = await prisma.project.create({
      data: {
        profileId: profile.id,
        title: validated.data.title,
        description: validated.data.description,
        link: validated.data.link || null,
        githubUrl: validated.data.githubUrl || null,
        technologies: techs,
      },
    });

    revalidatePath('/dashboard/profile');
    return { success: true, project };
  } catch (error) {
    console.error('Error adding project:', error);
    return { success: false, error: 'Failed to add project' };
  }
}

export async function deleteProject(id) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await prisma.project.delete({ where: { id } });
    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: 'Failed to delete project' };
  }
}

/**
 * Update Candidate Profile Avatar Image
 */
export async function updateUserAvatar(imageUrl) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    if (!imageUrl) {
      return { success: false, error: 'Image URL is required' };
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating user avatar:', error);
    return { success: false, error: 'Failed to update avatar' };
  }
}

