'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { companySchema } from '@/schemas/company';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/utils';

export async function getCompany() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    let company = await prisma.company.findUnique({
      where: { recruiterId: session.user.id },
      include: {
        jobs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!company) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      const name = user?.name ? `${user.name}'s Company` : 'My Company';
      company = await prisma.company.create({
        data: {
          recruiterId: session.user.id,
          name,
          slug: slugify(`${name}-${Date.now().toString().slice(-4)}`),
        },
        include: { jobs: true },
      });
    }

    return { success: true, company };
  } catch (error) {
    console.error('Error fetching company:', error);
    return { success: false, error: 'Failed to fetch company profile' };
  }
}

export async function updateCompany(formData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const validated = companySchema.safeParse(formData);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message };
    }

    const { name, description, website, location, size, industry, logo, coverImage } =
      validated.data;

    const slug = slugify(name);

    const company = await prisma.company.upsert({
      where: { recruiterId: session.user.id },
      update: {
        name,
        slug,
        description,
        website,
        location,
        size,
        industry,
        logo,
        coverImage,
      },
      create: {
        recruiterId: session.user.id,
        name,
        slug,
        description,
        website,
        location,
        size,
        industry,
        logo,
        coverImage,
      },
    });

    revalidatePath('/dashboard/company');
    return { success: true, company };
  } catch (error) {
    console.error('Error updating company:', error);
    return { success: false, error: 'Failed to update company profile' };
  }
}
