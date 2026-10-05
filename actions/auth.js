'use server';

import bcrypt from 'bcryptjs';
import { signIn, signOut } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { signUpSchema, signInSchema } from '@/schemas/auth';
import { cookies } from 'next/headers';

export async function registerUser(formData) {
  try {
    const validated = signUpSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'Validation failed',
      };
    }

    const { name, email, password, role } = validated.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role,
        profile: {
          create: {},
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}

export async function loginUser(formData) {
  try {
    const validated = signInSchema.safeParse(formData);

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'Validation failed',
      };
    }

    await signIn('credentials', {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });

    // Set theme cookie for immediate SSR rendering with user's saved theme
    try {
      const user = await prisma.user.findUnique({
        where: { email: validated.data.email },
        select: { id: true },
      });
      if (user?.id) {
        const setting = await prisma.systemSetting.findUnique({
          where: { key: `user_theme_${user.id}` },
        });
        const userTheme = setting?.value === 'dark' ? 'dark' : 'light';
        const cookieStore = await cookies();
        cookieStore.set('careerhub_theme', userTheme, {
          path: '/',
          maxAge: 31536000,
          sameSite: 'lax',
        });
      }
    } catch {
      // ignore
    }

    return { success: true };
  } catch (error) {
    if (error?.type === 'CredentialsSignin') {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }
    // If it's a redirect error from next-auth, we want to rethrow it
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.set('careerhub_theme', 'light', {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });
  } catch {
    // ignore
  }
  await signOut({ redirect: false });
  return { success: true };
}

export async function loginWithGoogle() {
  await signIn('google', { redirectTo: '/dashboard' });
}

export async function loginWithGithub() {
  await signIn('github', { redirectTo: '/dashboard' });
}
