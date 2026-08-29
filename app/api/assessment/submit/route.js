import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { judgeSubmission } from '@/lib/compiler/judge-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { problemId, code, language } = await req.json();

    if (!problemId || !code || !language) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const ALLOWED_LANGUAGES = ['python', 'java', 'cpp'];
    if (!ALLOWED_LANGUAGES.includes(language.toLowerCase())) {
      return NextResponse.json(
        { error: `Unsupported language "${language}". Only Python, Java, and C++ are supported.` },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true },
    });

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // 1. Filter ONLY Hidden Test Cases for official submission evaluation
    const hiddenTestCases = problem.testCases.filter((tc) => tc.isHidden);
    const testCasesToEvaluate = hiddenTestCases.length > 0 ? hiddenTestCases : problem.testCases;

    const judgeResult = await judgeSubmission({
      code,
      language,
      testCases: testCasesToEvaluate,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
    });

    const isAccepted = judgeResult.verdict === 'ACCEPTED';

    // 2. Record Submission
    const submission = await prisma.problemSubmission.create({
      data: {
        userId,
        problemId: problem.id,
        code,
        language,
        verdict: judgeResult.verdict,
        runtimeMs: judgeResult.executionTimeMs,
        memoryMb: judgeResult.memoryMb,
        passedCases: judgeResult.passedCases,
        totalCases: judgeResult.totalCases,
        errorMessage: judgeResult.compilationError || null,
        testResults: judgeResult.testResults,
      },
    });

    // 3. Update Problem Acceptance Stats
    const totalSub = problem.totalSubmissions + 1;
    const accSub = isAccepted ? problem.acceptedSubmissions + 1 : problem.acceptedSubmissions;
    const accRate = Math.round((accSub / totalSub) * 100 * 10) / 10;

    await prisma.problem.update({
      where: { id: problem.id },
      data: {
        totalSubmissions: totalSub,
        acceptedSubmissions: accSub,
        acceptanceRate: accRate,
      },
    });

    // 4. Update Candidate Progress & Stats
    const existingProgress = await prisma.userProblemProgress.findUnique({
      where: { userId_problemId: { userId, problemId: problem.id } },
    });

    const wasAlreadySolved = existingProgress?.status === 'SOLVED';

    await prisma.userProblemProgress.upsert({
      where: { userId_problemId: { userId, problemId: problem.id } },
      update: {
        status: isAccepted ? 'SOLVED' : existingProgress?.status === 'SOLVED' ? 'SOLVED' : 'ATTEMPTED',
        lastSubmittedAt: new Date(),
      },
      create: {
        userId,
        problemId: problem.id,
        status: isAccepted ? 'SOLVED' : 'ATTEMPTED',
        lastSubmittedAt: new Date(),
      },
    });

    // Update UserCodingStats
    let userStats = await prisma.userCodingStats.findUnique({ where: { userId } });
    if (!userStats) {
      userStats = await prisma.userCodingStats.create({
        data: { userId, lastActiveDate: new Date() },
      });
    }

    const earnedBadges = [];

    if (isAccepted && !wasAlreadySolved) {
      const pointsEarned = problem.difficulty === 'EASY' ? 10 : problem.difficulty === 'MEDIUM' ? 20 : 35;
      const isEasy = problem.difficulty === 'EASY';
      const isMedium = problem.difficulty === 'MEDIUM';
      const isHard = problem.difficulty === 'HARD';

      userStats = await prisma.userCodingStats.update({
        where: { userId },
        data: {
          solvedCount: { increment: 1 },
          easySolved: isEasy ? { increment: 1 } : undefined,
          mediumSolved: isMedium ? { increment: 1 } : undefined,
          hardSolved: isHard ? { increment: 1 } : undefined,
          acceptedCount: { increment: 1 },
          points: { increment: pointsEarned },
          totalSubmissions: { increment: 1 },
          lastActiveDate: new Date(),
        },
      });

      // Check Milestones & Badges
      if (userStats.solvedCount >= 1) {
        await awardBadge(userId, 'FIRST_BLOOD', earnedBadges);
      }
      if (userStats.solvedCount >= 5) {
        await awardBadge(userId, 'DSA_NOVICE', earnedBadges);
      }
      if (userStats.solvedCount >= 15) {
        await awardBadge(userId, 'ALGORITHM_MASTER', earnedBadges);
      }
      if (isHard) {
        await awardBadge(userId, 'HARD_CONQUEROR', earnedBadges);
      }
      if (judgeResult.executionTimeMs > 0 && judgeResult.executionTimeMs <= 50) {
        await awardBadge(userId, 'SPEED_DEMON', earnedBadges);
      }
    } else {
      await prisma.userCodingStats.update({
        where: { userId },
        data: {
          totalSubmissions: { increment: 1 },
          lastActiveDate: new Date(),
        },
      });
    }

    return NextResponse.json({
      ...judgeResult,
      submission,
      earnedBadges,
    });
  } catch (error) {
    console.error('Submit API Error:', error);
    return NextResponse.json({ error: error.message || 'Submission error' }, { status: 500 });
  }
}

async function awardBadge(userId, badgeCode, earnedList) {
  try {
    const badge = await prisma.badge.findUnique({ where: { code: badgeCode } });
    if (!badge) return;

    const existingUserBadge = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });

    if (!existingUserBadge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      earnedList.push(badge);
    }
  } catch (_) {}
}
