'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

/**
 * Get the saved theme for the currently authenticated user.
 * Defaults to 'light' for new/unauthenticated users.
 */
export async function getUserTheme() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      const cookieStore = await cookies();
      const cookieTheme = cookieStore.get('careerhub_theme')?.value;
      return cookieTheme === 'dark' ? 'dark' : 'light';
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: `user_theme_${userId}` },
    });

    return setting?.value === 'dark' ? 'dark' : 'light';
  } catch (error) {
    console.error('Error fetching user theme:', error);
    return 'light';
  }
}

/**
 * Save theme preference for a specific user to the database and cookie.
 * @param {'light'|'dark'} theme
 */
export async function saveUserTheme(theme) {
  try {
    const validTheme = theme === 'dark' ? 'dark' : 'light';
    const cookieStore = await cookies();

    // Set client-facing cookie for SSR rendering without flash
    cookieStore.set('careerhub_theme', validTheme, {
      path: '/',
      maxAge: 31536000, // 1 year
      sameSite: 'lax',
    });

    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
      await prisma.systemSetting.upsert({
        where: { key: `user_theme_${userId}` },
        update: { value: validTheme, category: 'USER_THEME' },
        create: {
          key: `user_theme_${userId}`,
          value: validTheme,
          category: 'USER_THEME',
        },
      });

      cookieStore.set(`careerhub_theme_${userId}`, validTheme, {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      });
    }

    return { success: true, theme: validTheme };
  } catch (error) {
    console.error('Error saving user theme:', error);
    return { success: false, error: 'Failed to save theme preference' };
  }
}
