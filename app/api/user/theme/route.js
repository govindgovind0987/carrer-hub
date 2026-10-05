import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      const cookieStore = await cookies();
      const cookieTheme = cookieStore.get('careerhub_theme')?.value;
      return NextResponse.json({
        theme: cookieTheme === 'dark' ? 'dark' : 'light',
      });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: `user_theme_${userId}` },
    });

    return NextResponse.json({
      theme: setting?.value === 'dark' ? 'dark' : 'light',
    });
  } catch (error) {
    console.error('API GET user theme error:', error);
    return NextResponse.json({ theme: 'light' });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const validTheme = body?.theme === 'dark' ? 'dark' : 'light';
    const cookieStore = await cookies();

    cookieStore.set('careerhub_theme', validTheme, {
      path: '/',
      maxAge: 31536000,
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

    return NextResponse.json({ success: true, theme: validTheme });
  } catch (error) {
    console.error('API POST user theme error:', error);
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}
