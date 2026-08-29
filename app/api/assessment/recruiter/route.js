import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Recruiter role required.' }, { status: 403 });
    }

    const assessments = await prisma.recruiterAssessment.findMany({
      where: { recruiterId: session.user.id },
      include: {
        candidateResults: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assessments });
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
