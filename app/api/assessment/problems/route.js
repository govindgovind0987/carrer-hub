import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAssessmentProblems } from '@/services/assessment';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'ALL';
    const difficulty = searchParams.get('difficulty') || 'ALL';
    const company = searchParams.get('company') || 'ALL';
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const status = searchParams.get('status') || 'ALL';
    const bookmarked = searchParams.get('bookmarked') === 'true';
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor') || null;

    const result = await getAssessmentProblems({
      category,
      difficulty,
      company,
      search,
      tag,
      status,
      bookmarked,
      userId,
      page,
      limit,
      cursor,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fetch Problems Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problems' },
      { status: 500 }
    );
  }
}
