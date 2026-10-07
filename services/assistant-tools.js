import { prisma } from '../lib/prisma.js';

/**
 * CareerHub Assistant Controlled Database & Context Tool Layer.
 * Every user-specific query is strictly scoped to the authenticated userId.
 * Raw SQL is NOT permitted; all queries use Prisma indexed lookups.
 */

export const CAREERHUB_ROUTES = [
  {
    name: 'Dashboard Overview',
    path: '/dashboard',
    description: 'Main dashboard with high-level readiness metrics, recent activity, and shortcuts.',
    category: 'General',
  },
  {
    name: 'Coding Assessment',
    path: '/dashboard/assessment',
    description: 'Practice 1500+ curated DSA coding challenges with live Monaco code editor and tests.',
    category: 'Coding & DSA',
  },
  {
    name: 'Coding Leaderboard',
    path: '/dashboard/assessment/leaderboard',
    description: 'Platform coding leaderboard, points, solved counts, and streaks.',
    category: 'Coding & DSA',
  },
  {
    name: 'AI Mock Interview',
    path: '/dashboard/mock-interview',
    description: 'AI-driven voice and technical mock interview platform with real-time feedback.',
    category: 'Interview Prep',
  },
  {
    name: 'Start New Mock Interview',
    path: '/dashboard/mock-interview/create',
    description: 'Configure and start a new tailored technical, behavioral, or full-loop interview.',
    category: 'Interview Prep',
  },
  {
    name: 'My Workspace',
    path: '/dashboard/career-workspace',
    description: 'Centralized workspace for resumes, learning roadmaps, skills, and profile.',
    category: 'Workspace',
  },
  {
    name: 'My Resumes',
    path: '/dashboard/resumes',
    description: 'Upload, manage, and version your professional resumes.',
    category: 'Resume & ATS',
  },
  {
    name: 'AI Resume Score & ATS',
    path: '/dashboard/ai-analysis',
    description: 'ATS scoring engine, keyword gap analysis, and tailored resume feedback.',
    category: 'Resume & ATS',
  },
  {
    name: 'AI Job Matcher',
    path: '/dashboard/job-match',
    description: 'Smart semantic matching connecting candidate profile and resumes to jobs.',
    category: 'Jobs',
  },
  {
    name: 'AI Career Coach',
    path: '/dashboard/career-coach',
    description: 'Strategic 30/90-day roadmaps, skill gap analysis, and AI career guidance.',
    category: 'Career Guidance',
  },
  {
    name: 'My Learning',
    path: '/dashboard/learning',
    description: 'Personalized DSA learning sequence, topic weaknesses, and problem roadmaps.',
    category: 'Learning',
  },
  {
    name: 'Skill Progress',
    path: '/dashboard/skill-progress',
    description: 'Detailed analytics and accuracy metrics across 20 Data Structures & Algorithms topics.',
    category: 'Analytics',
  },
  {
    name: 'My Profile',
    path: '/dashboard/profile',
    description: 'Manage personal details, skills, experience, education, and portfolio projects.',
    category: 'Profile',
  },
  {
    name: 'Settings',
    path: '/dashboard/settings',
    description: 'Manage account security, notifications, and application preferences.',
    category: 'Settings',
  },
  {
    name: 'Job Board',
    path: '/jobs',
    description: 'Browse all open developer and engineering job opportunities.',
    category: 'Jobs',
  },
];

/**
 * 1. Search Coding Problems
 * Uses indexed lookups by title, slug, tags, or difficulty without loading full problem dataset.
 */
export async function searchCodingProblems(query, { category, difficulty, limit = 5 } = {}) {
  try {
    const cleanQuery = (query || '').trim();
    const where = {};

    if (cleanQuery) {
      where.OR = [
        { title: { contains: cleanQuery, mode: 'insensitive' } },
        { slug: { contains: cleanQuery.toLowerCase().replace(/\s+/g, '-') } },
        { tags: { hasSome: [cleanQuery, cleanQuery.toLowerCase()] } },
        { category: { contains: cleanQuery, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty.toUpperCase())) {
      where.difficulty = difficulty.toUpperCase();
    }

    const problems = await prisma.problem.findMany({
      where,
      take: Math.min(limit, 10),
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        category: true,
        tags: true,
        acceptanceRate: true,
      },
      orderBy: { totalSubmissions: 'desc' },
    });

    return { success: true, count: problems.length, problems };
  } catch (error) {
    console.error('searchCodingProblems error:', error);
    return { success: false, error: 'Failed to search coding problems', problems: [] };
  }
}

/**
 * 2. Get Single Coding Problem Detail
 * Retrieves comprehensive problem statement, starter templates, examples, constraints,
 * and reference complexity for explanations and solutions.
 */
export async function getCodingProblem(identifier) {
  try {
    if (!identifier) return { success: false, error: 'Identifier is required' };

    const clean = identifier.trim();
    const problem = await prisma.problem.findFirst({
      where: {
        OR: [
          { id: clean },
          { slug: clean.toLowerCase().replace(/\s+/g, '-') },
          { title: { equals: clean, mode: 'insensitive' } },
          { title: { contains: clean, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        difficulty: true,
        category: true,
        tags: true,
        constraints: true,
        examples: true,
        hints: true,
        editorial: true,
        starterCode: true,
        referenceSolution: true,
        complexityAnalysis: true,
        timeLimitMs: true,
        memoryLimitMb: true,
        supportedLanguages: true,
      },
    });

    if (!problem) {
      return { success: false, error: `Problem "${identifier}" not found in CareerHub database.` };
    }

    return { success: true, problem };
  } catch (error) {
    console.error('getCodingProblem error:', error);
    return { success: false, error: 'Failed to fetch problem details' };
  }
}

/**
 * 3. Get User Recent Submissions (Strictly User-Scoped)
 */
export async function getUserSubmission(userId, { problemId, problemSlug, limit = 5 } = {}) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized: userId required' };

    let targetProblemId = problemId;
    if (!targetProblemId && problemSlug) {
      const prob = await prisma.problem.findUnique({
        where: { slug: problemSlug },
        select: { id: true },
      });
      targetProblemId = prob?.id;
    }

    const where = { userId };
    if (targetProblemId) {
      where.problemId = targetProblemId;
    }

    const submissions = await prisma.problemSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 5),
      select: {
        id: true,
        problemId: true,
        language: true,
        verdict: true,
        runtimeMs: true,
        memoryMb: true,
        passedCases: true,
        totalCases: true,
        errorMessage: true,
        code: true,
        createdAt: true,
        problem: {
          select: {
            title: true,
            slug: true,
            difficulty: true,
          },
        },
      },
    });

    return { success: true, submissions };
  } catch (error) {
    console.error('getUserSubmission error:', error);
    return { success: false, error: 'Failed to retrieve submissions', submissions: [] };
  }
}

/**
 * 4. Get Latest / Specified Mock Interview Session (Strictly User-Scoped)
 */
export async function getInterviewSession(userId, sessionId = null) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const session = sessionId
      ? await prisma.interviewSession.findFirst({
          where: { id: sessionId, userId },
          include: {
            questions: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                order: true,
                question: true,
                questionType: true,
                categoryName: true,
                difficulty: true,
                keyPoints: true,
              },
            },
            report: {
              select: {
                overallScore: true,
                summary: true,
                strengths: true,
                weaknesses: true,
              },
            },
          },
        })
      : await prisma.interviewSession.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                order: true,
                question: true,
                questionType: true,
                categoryName: true,
                difficulty: true,
                keyPoints: true,
              },
            },
            report: {
              select: {
                overallScore: true,
                summary: true,
                strengths: true,
                weaknesses: true,
              },
            },
          },
        });

    if (!session) {
      return { success: false, error: 'No interview session found for this candidate.' };
    }

    return { success: true, session };
  } catch (error) {
    console.error('getInterviewSession error:', error);
    return { success: false, error: 'Failed to fetch interview session' };
  }
}

/**
 * 5. Get Interview Question and User's Answer (Strictly User-Scoped)
 */
export async function getInterviewQuestion(userId, { sessionId, questionIndex = 0, questionId = null }) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };

    let question = null;

    if (questionId) {
      question = await prisma.interviewQuestion.findFirst({
        where: { id: questionId, userId },
        include: {
          answers: { orderBy: { createdAt: 'desc' }, take: 1 },
          feedbacks: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
    } else {
      // Find session first
      const sess = sessionId
        ? await prisma.interviewSession.findFirst({ where: { id: sessionId, userId } })
        : await prisma.interviewSession.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });

      if (!sess) return { success: false, error: 'No interview session found.' };

      const questions = await prisma.interviewQuestion.findMany({
        where: { sessionId: sess.id, userId },
        orderBy: { order: 'asc' },
        include: {
          answers: { orderBy: { createdAt: 'desc' }, take: 1 },
          feedbacks: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });

      const idx = Math.max(0, Math.min(questionIndex, questions.length - 1));
      question = questions[idx] || null;
    }

    if (!question) {
      return { success: false, error: 'Interview question not found.' };
    }

    return {
      success: true,
      question: {
        id: question.id,
        order: question.order,
        questionText: question.question,
        sampleAnswer: question.sampleAnswer,
        explanation: question.explanation,
        keyPoints: question.keyPoints,
        commonMistakes: question.commonMistakes,
        userAnswer: question.answers[0]?.userAnswer || null,
        codeSnippet: question.answers[0]?.codeSnippet || null,
        feedback: question.feedbacks[0] || null,
      },
    };
  } catch (error) {
    console.error('getInterviewQuestion error:', error);
    return { success: false, error: 'Failed to fetch interview question' };
  }
}

/**
 * 6. Get Interview Report (Strictly User-Scoped)
 */
export async function getInterviewReport(userId, sessionId = null) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const report = sessionId
      ? await prisma.interviewReport.findFirst({
          where: { sessionId, userId },
        })
      : await prisma.interviewReport.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

    if (!report) {
      return { success: false, error: 'No interview report found for candidate.' };
    }

    return { success: true, report };
  } catch (error) {
    console.error('getInterviewReport error:', error);
    return { success: false, error: 'Failed to fetch interview report' };
  }
}

/**
 * 7. Get User Resume (Strictly User-Scoped)
 */
export async function getUserResume(userId) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      take: 3,
      select: {
        id: true,
        title: true,
        isDefault: true,
        fileUrl: true,
        createdAt: true,
        versions: {
          select: { versionNumber: true, changesDescription: true },
          take: 3,
        },
      },
    });

    return { success: true, count: resumes.length, resumes };
  } catch (error) {
    console.error('getUserResume error:', error);
    return { success: false, error: 'Failed to fetch resumes', resumes: [] };
  }
}

/**
 * 8. Get ATS Score & Analysis (Strictly User-Scoped)
 */
export async function getATSScore(userId) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const analysis = await prisma.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        resumeId: true,
        overallScore: true,
        atsScore: true,
        summary: true,
        weakAreas: true,
        strongAreas: true,
        missingSkills: true,
        keywordAnalysis: true,
        grammarSuggestions: true,
        formattingSuggestions: true,
        careerSuggestions: true,
        interviewReadiness: true,
        createdAt: true,
      },
    });

    if (!analysis) {
      return { success: false, error: 'No ATS analysis records found yet. Upload a resume to get an ATS score.' };
    }

    return { success: true, analysis };
  } catch (error) {
    console.error('getATSScore error:', error);
    return { success: false, error: 'Failed to fetch ATS analysis' };
  }
}

/**
 * 9. Get User Profile & Skills (Strictly User-Scoped)
 */
export async function getUserProfile(userId) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        skills: { select: { name: true, level: true, category: true } },
        experiences: { select: { title: true, company: true, current: true, description: true } },
        educations: { select: { degree: true, institution: true, fieldOfStudy: true } },
        projects: { select: { title: true, description: true, technologies: true } },
      },
    });

    if (!profile) {
      return { success: false, error: 'Profile not set up yet.' };
    }

    return {
      success: true,
      profile: {
        headline: profile.headline,
        bio: profile.bio,
        skills: profile.skills,
        experiences: profile.experiences,
        educations: profile.educations,
        projects: profile.projects,
      },
    };
  } catch (error) {
    console.error('getUserProfile error:', error);
    return { success: false, error: 'Failed to fetch user profile' };
  }
}

/**
 * 10. Get Learning Progress & Coding Stats (Strictly User-Scoped)
 */
export async function getLearningProgress(userId) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const [stats, progressCount, solvedCount] = await Promise.all([
      prisma.userCodingStats.findUnique({
        where: { userId },
      }),
      prisma.userProblemProgress.count({
        where: { userId },
      }),
      prisma.userProblemProgress.count({
        where: { userId, status: 'SOLVED' },
      }),
    ]);

    return {
      success: true,
      learningProgress: {
        solvedCount: stats?.solvedCount || solvedCount || 0,
        easySolved: stats?.easySolved || 0,
        mediumSolved: stats?.mediumSolved || 0,
        hardSolved: stats?.hardSolved || 0,
        streakDays: stats?.streakDays || 0,
        totalAttempted: progressCount || 0,
      },
    };
  } catch (error) {
    console.error('getLearningProgress error:', error);
    return { success: false, error: 'Failed to fetch learning progress' };
  }
}

/**
 * 11. Get Job Matches (Strictly User-Scoped)
 */
export async function getJobMatches(userId) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };

    const matches = await prisma.jobMatch.findMany({
      where: { userId },
      orderBy: { matchScore: 'desc' },
      take: 5,
      select: {
        matchScore: true,
        jobTitle: true,
        missingSkills: true,
        recommendedSkills: true,
        job: {
          select: {
            title: true,
            location: true,
            jobType: true,
            company: { select: { name: true } },
          },
        },
      },
    });

    return { success: true, count: matches.length, matches };
  } catch (error) {
    console.error('getJobMatches error:', error);
    return { success: false, error: 'Failed to fetch job matches', matches: [] };
  }
}
