import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Recruiter role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '20', 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 20;
    const where = { recruiterId: session.user.id };

    const [assessments, total] = await Promise.all([
      prisma.recruiterAssessment.findMany({
        where,
        include: { candidateResults: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.recruiterAssessment.count({ where }),
    ]);

    return NextResponse.json({
      assessments,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Recruiter role required.' }, { status: 403 });
    }

    const { title, description, difficulty, timeLimitMinutes, passingScore, problemIds, customQuestions } =
      await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Assessment title is required' }, { status: 400 });
    }

    const accessCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const newAssessment = await prisma.recruiterAssessment.create({
      data: {
        recruiterId: session.user.id,
        title,
        description: description || '',
        difficulty: difficulty || 'MEDIUM',
        timeLimitMinutes: Number(timeLimitMinutes) || 60,
        passingScore: Number(passingScore) || 70,
        problemIds: problemIds || [],
        customQuestions: customQuestions || [],
        accessCode,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, assessment: newAssessment });
  } catch (error) {
    console.error('Create Assessment Error:', error);
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}
