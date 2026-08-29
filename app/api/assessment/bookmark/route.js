import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemId, bookmarked } = await req.json();

    const result = await prisma.userProblemProgress.upsert({
      where: { userId_problemId: { userId: session.user.id, problemId } },
      update: { bookmarked },
      create: { userId: session.user.id, problemId, bookmarked },
    });

    return NextResponse.json({ success: true, bookmarked: result.bookmarked });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}
