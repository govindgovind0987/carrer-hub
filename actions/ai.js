'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeResumeWithAI, matchJobWithAI, generateInterviewQuestionsWithAI } from '@/services/ai';
import { revalidatePath } from 'next/cache';

/**
 * Trigger AI Resume Analysis & ATS Report Generation
 */
export async function runResumeAnalysisAction(resumeId, targetJobDescription = null) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        user: {
          include: {
            profile: {
              include: {
                skills: true,
                experiences: true,
                educations: true,
                projects: true,
                certificates: true,
                achievements: true,
              },
            },
          },
        },
      },
    });

    if (!resume) return { success: false, error: 'Resume not found' };

    // Construct full multi-section resume context
    const profile = resume.user?.profile;
    const skillsList = profile?.skills?.map((s) => s.name).join(', ') || '';
    const expList = profile?.experiences?.map((e) => `${e.title} at ${e.company}: ${e.description || ''}`).join('\n') || '';
    const projList = profile?.projects?.map((p) => `${p.title}: ${p.description || ''} (${(p.technologies || []).join(', ')}) ${p.githubUrl || p.link || ''}`).join('\n') || '';
    const eduList = profile?.educations?.map((ed) => `${ed.degree} in ${ed.fieldOfStudy || 'CS'} from ${ed.institution}`).join('\n') || '';
    const achList = profile?.achievements?.map((a) => `${a.title}: ${a.description}`).join('\n') || '';

    const resumeTextContent = `
Candidate Name: ${session.user.name || 'Candidate'}
Email: ${session.user.email || ''}
Phone: ${profile?.phone || ''}
Location: ${profile?.location || ''}
LinkedIn: ${profile?.linkedinUrl || ''}
GitHub: ${profile?.githubUrl || ''}

SUMMARY
${profile?.headline || ''} ${profile?.bio || ''}

SKILLS
${skillsList}

WORK EXPERIENCE
${expList}

PROJECTS
${projList}

EDUCATION
${eduList}

ACHIEVEMENTS & CERTIFICATIONS
${achList}
    `;

    // Perform AI Analysis
    const analysisData = await analyzeResumeWithAI(resumeTextContent, targetJobDescription);

    // Save ResumeAnalysis in DB
    const analysis = await prisma.resumeAnalysis.create({
      data: {
        userId: session.user.id,
        resumeId: resume.id,
        overallScore: analysisData.overallScore,
        atsScore: analysisData.atsScore,
        summary: analysisData.summary,
        weakAreas: analysisData.weakAreas || [],
        strongAreas: analysisData.strongAreas || [],
        missingSkills: analysisData.missingSkills || [],
        keywordAnalysis: {
          categoryScores: analysisData.categoryScores,
          categoryExplanations: analysisData.categoryExplanations,
          priorityImprovements: analysisData.priorityImprovements,
          qualityLevel: analysisData.qualityLevel,
          baseScore: analysisData.baseScore,
          aiAdjustment: analysisData.aiAdjustment,
          detectedKeywords: analysisData.keywordAnalysis?.detectedKeywords || [],
          highValueMissing: analysisData.keywordAnalysis?.highValueMissing || [],
        },
        grammarSuggestions: analysisData.grammarSuggestions || [],
        formattingSuggestions: analysisData.formattingSuggestions || [],
        careerSuggestions: analysisData.careerSuggestions || [],
        interviewReadiness: analysisData.interviewReadiness || 'High',
      },
    });

    // Save ATSReport in DB
    const atsReport = await prisma.aTSReport.create({
      data: {
        analysisId: analysis.id,
        resumeId: resume.id,
        userId: session.user.id,
        score: analysisData.atsScore,
        keywordsFound: analysisData.keywordAnalysis?.detectedKeywords || [],
        missingKeywords: analysisData.keywordAnalysis?.highValueMissing || [],
        formattingScore: Math.round((analysisData.categoryScores?.formatting / 5) * 100) || 85,
        readabilityScore: Math.round((analysisData.categoryScores?.ats / 15) * 100) || 85,
        sectionScores: analysisData.categoryScores,
        recommendations: analysisData.formattingSuggestions || [],
      },
    });

    // Log in AI History
    await prisma.aIHistory.create({
      data: {
        userId: session.user.id,
        type: 'RESUME_ANALYSIS',
        inputData: { resumeId, title: resume.title },
        outputData: { overallScore: analysis.overallScore, atsScore: analysis.atsScore, qualityLevel: analysisData.qualityLevel },
      },
    });

    revalidatePath('/dashboard/ai-analysis');
    revalidatePath('/dashboard');
    return { success: true, analysis, atsReport };
  } catch (error) {
    console.error('Error running resume analysis:', error);
    return { success: false, error: 'Failed to analyze resume' };
  }
}

/**
 * Trigger AI Job Match Analysis
 */
export async function runJobMatchAction(resumeId, jobId) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const [resume, job] = await Promise.all([
      prisma.resume.findUnique({
        where: { id: resumeId },
        include: { user: { include: { profile: { include: { skills: true, experiences: true } } } } },
      }),
      prisma.job.findUnique({
        where: { id: jobId },
        include: { company: true },
      }),
    ]);

    if (!resume || !job) return { success: false, error: 'Resume or Job not found' };

    const skillsList = resume.user?.profile?.skills?.length
      ? resume.user.profile.skills.map((s) => s.name).join(', ')
      : 'React, Next.js, Node.js, JavaScript, TypeScript, PostgreSQL, REST APIs';
    const expList = resume.user?.profile?.experiences?.length
      ? resume.user.profile.experiences.map((e) => `${e.title} at ${e.company}: ${e.description || ''}`).join('\n')
      : 'Software Engineer - Full Stack Web Application Development';

    const resumeText = `Resume Title: ${resume.title}\nSkills: ${skillsList}\nExperience:\n${expList}`;
    const jobText = `Title: ${job.title}\nCategory: ${job.category}\nDescription: ${job.description}\nRequirements: ${job.requirements}`;

    // Perform AI Job Match
    const matchData = await matchJobWithAI(resumeText, jobText);

    // Save JobMatch
    const jobMatch = await prisma.jobMatch.create({
      data: {
        userId: session.user.id,
        resumeId: resume.id,
        jobId: job.id,
        matchScore: matchData.matchScore || 85,
        candidateTitle: matchData.candidateTitle || 'Candidate',
        jobTitle: job.title,
        missingSkills: matchData.missingSkills || [],
        recommendedSkills: matchData.recommendedSkills || [],
        suggestions: matchData.suggestions || [],
        recommendation: matchData.recommendation || '',
      },
    });

    // Log AI History
    await prisma.aIHistory.create({
      data: {
        userId: session.user.id,
        type: 'JOB_MATCH',
        inputData: { resumeId, jobId },
        outputData: { matchScore: jobMatch.matchScore },
      },
    });

    revalidatePath('/dashboard/job-match');
    return { success: true, jobMatch };
  } catch (error) {
    console.error('Error running job match:', error);
    return { success: false, error: 'Failed to run job match' };
  }
}

/**
 * Fetch Recent AI Reports & History
 */
export async function getAIReportsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const [latestAnalysis, latestJobMatches, aiHistories] = await Promise.all([
      prisma.resumeAnalysis.findFirst({
        where: { userId: session.user.id },
        include: { atsReports: true, resume: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobMatch.findMany({
        where: { userId: session.user.id },
        include: { job: { include: { company: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.aIHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return { success: true, latestAnalysis, latestJobMatches, aiHistories };
  } catch (error) {
    console.error('Error fetching AI reports:', error);
    return { success: false, error: 'Failed to fetch AI reports' };
  }
}

import {
  generateInterviewSessionAI,
  generateSimilarQuestionsAI,
  explainAnswerAI,
  simplifyAnswerAI,
  modifyQuestionDifficultyAI,
} from '@/services/interview-ai';

/**
 * Generate Custom Interview Session with AI
 */
export async function generateCustomInterviewAction({
  role = 'Software Engineer',
  category = 'Technical',
  difficulty = 'MEDIUM',
  experience = 'MID_LEVEL',
  numberOfQuestions = 10,
  companyStyle = 'General Interview',
  refresh = false,
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const numQ = parseInt(numberOfQuestions) || 10;

    // Call Groq AI generator
    const generated = await generateInterviewSessionAI({
      role,
      technology: category,
      category,
      companyStyle,
      experience,
      difficulty,
      numberOfQuestions: numQ,
    });

    // Create InterviewSession in database with schema-safe fallback
    const sessionData = {
      userId: session.user.id,
      role: role || 'Software Engineer',
      technology: category || 'Technical',
      companyStyle: companyStyle || 'General Interview',
      experience: experience || 'MID_LEVEL',
      difficulty: ['EASY', 'MEDIUM', 'HARD'].includes((difficulty || '').toUpperCase()) ? difficulty.toUpperCase() : 'MEDIUM',
      numberOfQuestions: generated.length,
      status: 'CREATED',
    };

    let dbSession;
    try {
      dbSession = await prisma.interviewSession.create({ data: sessionData });
    } catch (sessionErr) {
      console.warn('InterviewSession create fallback retry:', sessionErr.message);
      delete sessionData.companyStyle;
      dbSession = await prisma.interviewSession.create({ data: sessionData });
    }

    // Create InterviewQuestions in database with schema-safe fallback
    const createdQuestions = await Promise.all(
      generated.map(async (q, idx) => {
        const questionData = {
          userId: session.user.id,
          sessionId: dbSession.id,
          order: idx + 1,
          role,
          companyStyle: companyStyle || 'General Interview',
          categoryName: category,
          difficulty: ['EASY', 'MEDIUM', 'HARD'].includes((difficulty || '').toUpperCase()) ? difficulty.toUpperCase() : 'MEDIUM',
          question: q.question,
          sampleAnswer: q.sampleAnswer || 'Expected answer detailing architecture and performance.',
          explanation: q.explanation || q.sampleAnswer || 'Detailed technical breakdown.',
          bestAnswer: q.bestAnswer || q.sampleAnswer || 'Model answer following enterprise standards.',
          alternativeAnswer: q.alternativeAnswer || 'Alternative trade-off approach.',
          commonMistakes: Array.isArray(q.commonMistakes) ? q.commonMistakes : [],
          interviewTips: Array.isArray(q.interviewTips) ? q.interviewTips : [],
          keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints : [],
          followUp: q.followUp || null,
        };

        try {
          return await prisma.interviewQuestion.create({ data: questionData });
        } catch (qErr) {
          delete questionData.companyStyle;
          delete questionData.categoryName;
          delete questionData.role;
          delete questionData.explanation;
          delete questionData.bestAnswer;
          delete questionData.alternativeAnswer;
          delete questionData.commonMistakes;
          delete questionData.interviewTips;
          return await prisma.interviewQuestion.create({ data: questionData });
        }
      })
    );

    return {
      success: true,
      sessionId: dbSession.id,
      questions: createdQuestions,
      session: dbSession,
    };
  } catch (error) {
    console.error('Error generating custom interview:', error);
    return { success: false, error: 'Failed to generate custom interview: ' + error.message };
  }
}

/**
 * Legacy & Category Retrieve Questions
 */
export async function getInterviewQuestionsAction(category = 'TECHNICAL', difficulty = 'MEDIUM') {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    let questions = await prisma.interviewQuestion.findMany({
      where: { userId: session.user.id, categoryName: category },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (questions.length === 0) {
      const res = await generateCustomInterviewAction({
        role: 'Software Engineer',
        category,
        difficulty,
        numberOfQuestions: 5,
      });
      if (res.success) questions = res.questions;
    }

    return { success: true, questions };
  } catch (error) {
    console.error('Error fetching interview questions:', error);
    return { success: false, error: 'Failed to load interview questions' };
  }
}

/**
 * Action: Generate 3 Similar Questions with AI
 */
export async function generateSimilarQuestionsAction({ questionText, category, difficulty, role }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const similar = await generateSimilarQuestionsAI({ questionText, category, difficulty, role });
    return { success: true, questions: similar };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Action: AI Explain Answer
 */
export async function explainAnswerAction({ questionText, answerText }) {
  try {
    const explanation = await explainAnswerAI({ questionText, answerText });
    return { success: true, explanation };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Action: AI Simplify Answer
 */
export async function simplifyAnswerAction({ questionText, answerText }) {
  try {
    const simplified = await simplifyAnswerAI({ questionText, answerText });
    return { success: true, simplified };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Action: Modify Difficulty (Make Harder / Make Easier)
 */
export async function modifyQuestionDifficultyAction({ questionText, currentDifficulty, targetDifficulty, role }) {
  try {
    const modified = await modifyQuestionDifficultyAI({ questionText, currentDifficulty, targetDifficulty, role });
    return { success: true, question: modified };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Action: Toggle Bookmark Question
 */
export async function toggleBookmarkQuestionAction(questionId, bookmarked) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: { bookmarked },
    });
    return { success: true, bookmarked };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Action: Get Previous Interview History Sessions
 */
export async function getUserInterviewHistoryAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: session.user.id },
      include: {
        questions: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { success: true, sessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
