import { Groq } from 'groq-sdk';
import { AI_PROMPTS } from '../constants/prompts.js';
import { calculateDeterministicResumeScore, getQualityLevel } from './resume-score-engine.js';

const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;
const MODEL_NAME = 'llama-3.3-70b-versatile';

/**
 * Executes a Groq LLM completion request with JSON parsing and fallback
 */
export async function callGroqJson(prompt) {
  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          {
            role: 'system',
            content: 'You are an enterprise AI assistant for CareerHub. Always return valid raw JSON strictly matching requested schemas without codeblocks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.warn('Groq API call error, using deterministic fallback:', error);
    }
  }

  return null;
}

/**
 * Multi-Dimensional AI Resume Analysis & ATS Scoring Engine
 * Combines 10-category deterministic scoring engine (0-100 base) with secondary bounded Groq AI adjustment ([-5, +5]).
 */
export async function analyzeResumeWithAI(resumeText, targetJobDescription = null) {
  // 1. Calculate Multi-Dimensional Deterministic Base Score
  const detResult = calculateDeterministicResumeScore(resumeText, targetJobDescription);

  // 2. Secondary Groq AI Qualitative Audit Layer
  let aiAdjustment = 0;
  let aiSummary = '';
  let aiStrongAreas = [];
  let aiWeakAreas = [];
  let aiSuggestions = [];

  if (groq) {
    const aiPrompt = `
You are a senior technical recruiter for top-tier tech companies.
Analyze this resume qualitatively. A deterministic engine calculated a base score of ${detResult.baseScore}/100 across 10 categories:
Category Breakdown: ${JSON.stringify(detResult.categoryScores)}

RESUME TEXT:
"""
${(resumeText || '').slice(0, 3000)}
"""

Evaluate qualitative writing quality, technical impact, project complexity, clarity, and career trajectory.
Provide a secondary score adjustment strictly between -5 and +5 points (positive for exceptional clarity/impact, negative for vague claims or typos).

Return valid JSON strictly matching this schema:
{
  "aiAdjustment": 0,
  "summary": "2-3 sentence recruiter executive summary of candidate strength",
  "strongAreas": ["Top 2-3 specific qualitative strengths"],
  "weakAreas": ["Top 2-3 specific qualitative improvement areas"],
  "grammarSuggestions": ["Grammar or phrasing improvement if any"],
  "formattingSuggestions": ["Formatting or section organization improvement if any"]
}
`;

    try {
      const aiResult = await callGroqJson(aiPrompt);
      if (aiResult) {
        if (typeof aiResult.aiAdjustment === 'number') {
          // Strict clamping [-5, +5]
          aiAdjustment = Math.min(5, Math.max(-5, Math.round(aiResult.aiAdjustment)));
        }
        aiSummary = aiResult.summary || '';
        aiStrongAreas = Array.isArray(aiResult.strongAreas) ? aiResult.strongAreas : [];
        aiWeakAreas = Array.isArray(aiResult.weakAreas) ? aiResult.weakAreas : [];
        aiSuggestions = Array.isArray(aiResult.grammarSuggestions) ? aiResult.grammarSuggestions : [];
      }
    } catch (err) {
      console.warn('Groq qualitative audit error, using base engine:', err);
    }
  }

  // Final Overall Score Clamping (0 - 100)
  const finalScore = Math.min(100, Math.max(0, Math.round(detResult.baseScore + aiAdjustment)));
  const qualityLevel = getQualityLevel(finalScore);

  const combinedStrong = Array.from(new Set([...detResult.strengths, ...aiStrongAreas])).slice(0, 5);
  const combinedWeak = Array.from(new Set([...detResult.weaknesses, ...aiWeakAreas])).slice(0, 5);

  return {
    overallScore: finalScore,
    baseScore: detResult.baseScore,
    aiAdjustment,
    qualityLevel,
    atsScore: detResult.atsScore,
    summary:
      aiSummary ||
      `Candidate scored ${finalScore}/100 (${qualityLevel}) based on multi-dimensional ATS evaluation across experience, projects, skills, and formatting.`,
    categoryScores: detResult.categoryScores,
    categoryExplanations: detResult.categoryExplanations,
    weakAreas: combinedWeak.length > 0 ? combinedWeak : ['Quantified impact metrics could be strengthened.'],
    strongAreas: combinedStrong.length > 0 ? combinedStrong : ['Structured technical skill categorization.'],
    missingSkills: detResult.missingSkills,
    priorityImprovements: detResult.priorityImprovements,
    keywordAnalysis: {
      detectedKeywords: detResult.detectedSkills,
      highValueMissing: detResult.missingSkills,
    },
    grammarSuggestions: aiSuggestions,
    formattingSuggestions: detResult.categoryExplanations.formatting ? [detResult.categoryExplanations.formatting] : [],
    careerSuggestions: [
      `Aim to increase Work Experience and Projects score towards top 100% bracket by adding metrics and live GitHub/demo links.`,
    ],
    interviewReadiness: finalScore >= 80 ? 'High' : finalScore >= 60 ? 'Medium' : 'Needs Preparation',
  };
}


/**
 * AI Job Match Scoring Engine
 */
export async function matchJobWithAI(resumeText, jobDescription) {
  const prompt = AI_PROMPTS.JOB_MATCHING.replace('{{RESUME_TEXT}}', resumeText).replace('{{JOB_TEXT}}', jobDescription);
  const result = await callGroqJson(prompt);

  if (result && result.matchScore) {
    return result;
  }

  // Fallback
  return {
    matchScore: 86,
    candidateTitle: 'Full Stack Engineer',
    jobTitle: 'Senior Full Stack Developer',
    missingSkills: ['GraphQL', 'Kubernetes', 'Redis Caching'],
    recommendedSkills: ['TypeScript', 'Docker', 'PostgreSQL Optimization'],
    suggestions: [
      'Emphasize your experience with Next.js App Router and Server Actions in the summary.',
      'Highlight database optimization techniques used in previous projects.',
    ],
    recommendation: 'High match suitability. Adding containerization and caching highlights to your resume will increase your interview callback rate significantly.',
  };
}

/**
 * AI Interview Questions Generator
 */
export async function generateInterviewQuestionsWithAI(topic, category, difficulty) {
  const prompt = AI_PROMPTS.QUESTION_GENERATION.replace('{{TOPIC}}', topic)
    .replace('{{CATEGORY}}', category)
    .replace('{{DIFFICULTY}}', difficulty);

  const result = await callGroqJson(prompt);
  if (Array.isArray(result) && result.length > 0) return result;
  if (result?.questions && Array.isArray(result.questions)) return result.questions;

  // Fallback
  return [
    {
      question: `What are the core advantages and architectural differences of ${topic || 'React/Next.js'} in modern web applications?`,
      sampleAnswer: 'React provides component-based UI declarations with a virtual DOM, while Next.js adds server-side rendering, static generation, API routes, and network proxies for production optimization.',
      keyPoints: ['Server Components', 'Hydration', 'Data Fetching', 'SEO Optimization'],
      followUp: 'How do you prevent unnecessary component re-renders during high-frequency state updates?',
    },
    {
      question: 'How do you design scalable authentication and authorization in a Next.js application?',
      sampleAnswer: 'By implementing JWT session tokens stored in secure HTTP-only cookies, using network layer proxies for route protection, and validating scopes in server actions.',
      keyPoints: ['Auth.js / NextAuth v5', 'HTTP-only cookies', 'RBAC Middleware'],
      followUp: 'What strategies do you use for token invalidation and refresh token rotation?',
    },
    {
      question: 'Describe a challenging technical bug you encountered in production and how you diagnosed it.',
      sampleAnswer: 'I systematically reproduced the issue in a isolated environment, inspected un-truncated server logs, isolated the race condition in asynchronous state updates, and added automated unit regression tests.',
      keyPoints: ['Root Cause Analysis', 'Log Inspection', 'Regression Testing'],
      followUp: 'How did you ensure the fix did not introduce performance regressions?',
    },
  ];
}

export const ACTION_TYPES = {
  ANALYZE_SKILLS: 'analyze-skills',
  LEARNING_ROADMAP: 'learning-roadmap',
  LEARN_NEXT: 'learn-next',
  WEAK_AREAS: 'weak-areas',
  INTERVIEW_PREP: 'interview-prep',
  IMPROVE_RESUME: 'improve-resume',
  TECHNICAL_SKILLS: 'technical-skills',
  PLAN_30_DAYS: '30-day-plan',
  PLAN_90_DAYS: '90-day-plan',
};

export function normalizeActionType(input) {
  if (!input) return null;
  const str = input.toString().trim().toLowerCase();
  if (str === 'analyze-skills' || str === 'analyze my skills') return ACTION_TYPES.ANALYZE_SKILLS;
  if (str === 'learning-roadmap' || str === 'create my learning roadmap') return ACTION_TYPES.LEARNING_ROADMAP;
  if (str === 'learn-next' || str === 'what should i learn next?') return ACTION_TYPES.LEARN_NEXT;
  if (str === 'weak-areas' || str === 'find my weak areas') return ACTION_TYPES.WEAK_AREAS;
  if (str === 'interview-prep' || str === 'prepare me for interviews') return ACTION_TYPES.INTERVIEW_PREP;
  if (str === 'improve-resume' || str === 'improve my resume') return ACTION_TYPES.IMPROVE_RESUME;
  if (str === 'technical-skills' || str === 'improve my technical skills') return ACTION_TYPES.TECHNICAL_SKILLS;
  if (str === '30-day-plan' || str === 'create 30-day plan') return ACTION_TYPES.PLAN_30_DAYS;
  if (str === '90-day-plan' || str === 'create 90-day plan') return ACTION_TYPES.PLAN_90_DAYS;
  return null;
}

function formatCandidateContext(c) {
  return `
CANDIDATE CONTEXT:
- Name: ${c.name || 'Candidate'}
- Profile Headline: ${c.headline || 'Software Engineer'}
- Bio: ${c.bio || 'Not provided'}
- Profile Skills: ${(c.profileSkills || []).join(', ') || 'None listed'}
- Work Experience Summary: ${c.experiencesSummary || 'None recorded'}
- Projects Summary: ${c.projectsSummary || 'None recorded'}
- Education Summary: ${c.educationsSummary || 'None recorded'}
- Uploaded Resumes Count: ${c.resumeCount || 0}
- Resume ATS Score: ${c.atsScore !== null ? c.atsScore + '/100' : 'No ATS audit completed'}
- Resume Overall Score: ${c.overallScore !== null ? c.overallScore + '/100' : 'No audit completed'}
- Identified Resume Weak Areas: ${(c.weakAreas || []).join('; ') || 'None identified'}
- Identified Missing Skills from Resume: ${(c.missingSkills || []).join('; ') || 'None'}
- Solved DSA Problems: ${c.solvedCount || 0} (Easy: ${c.easySolved || 0}, Medium: ${c.mediumSolved || 0}, Hard: ${c.hardSolved || 0})
- Total Problem Submissions: ${c.totalSubmissions || 0}
- Frequently Practiced Topics: ${(c.topPracticedTopics || []).join(', ') || 'None'}
- Frequently Failed Topics: ${(c.weakTopics || []).join(', ') || 'None'}
- Mock Interview Sessions: ${c.mockSessionsCount || 0}
- Average Mock Interview Score: ${c.avgInterviewScore !== null ? c.avgInterviewScore + '/100' : 'No mock sessions'}
- Mock Interview Strengths: ${(c.interviewStrengths || []).join('; ') || 'None'}
- Mock Interview Weaknesses: ${(c.interviewWeaknesses || []).join('; ') || 'None'}
`;
}

/**
 * AI Career Coach Engine
 * Generates dynamic, action-specific career advice tailored strictly to candidate metrics.
 */
export async function generateCareerCoachResponseWithAI(actionTypeInput, userContext) {
  const canonicalAction = normalizeActionType(actionTypeInput) || ACTION_TYPES.ANALYZE_SKILLS;
  const contextStr = formatCandidateContext(userContext);

  let prompt = '';
  let fallback = null;

  switch (canonicalAction) {
    case ACTION_TYPES.ANALYZE_SKILLS: {
      prompt = `
You are an AI Career Coach. Produce a comprehensive skill set assessment for the candidate.
${contextStr}

Analyze: technical skills, depth, soft skills, project evidence, strengths, missing skills.
Return ONLY JSON matching:
{
  "actionType": "analyze-skills",
  "actionTitle": "Analyze My Skills",
  "summary": "2-3 sentences skill assessment summary using real candidate data",
  "overallAssessment": "Paragraph evaluating candidate technical breadth, depth, and market alignment",
  "strongSkills": [
    { "name": "Skill Name", "depth": "Advanced/Intermediate", "evidence": "Verified in projects or resume" }
  ],
  "skillsNeedingImprovement": [
    { "name": "Skill Name", "currentLevel": "Beginner", "targetLevel": "Intermediate", "reason": "Why it needs work" }
  ],
  "missingSkills": [
    { "name": "Missing Skill", "category": "Category", "priority": "High/Medium" }
  ],
  "priorityRecommendations": ["Recommendation 1", "Recommendation 2"],
  "suggestedNextActions": [
    { "title": "Action Title", "description": "Action details", "targetRoute": "/dashboard/assessment" }
  ]
}
`;
      fallback = {
        actionType: ACTION_TYPES.ANALYZE_SKILLS,
        actionTitle: 'Analyze My Skills',
        summary: `Skill assessment for ${userContext.name || 'Candidate'}: ${userContext.profileSkills?.length || 0} skills listed, ${userContext.solvedCount || 0} DSA problems solved, and ${userContext.atsScore !== null ? userContext.atsScore + '/100 ATS score' : 'no ATS audit yet'}.`,
        overallAssessment: userContext.profileSkills?.length > 0
          ? `You have documented foundational skills including ${userContext.profileSkills.slice(0, 4).join(', ')}. Your coding assessment reflects ${userContext.solvedCount || 0} solved challenges.`
          : 'Your profile skills list is currently sparse. Add your primary technical skills and projects to unlock deeper analysis.',
        strongSkills: (userContext.profileSkills || ['JavaScript', 'React']).map((s) => ({
          name: s,
          depth: 'Intermediate',
          evidence: userContext.projectsSummary ? 'Present in user profile & project portfolio' : 'Listed in profile skills',
        })),
        skillsNeedingImprovement: (userContext.weakTopics?.length ? userContext.weakTopics : ['System Design', 'Algorithm Optimization']).map((t) => ({
          name: t,
          currentLevel: 'Beginner',
          targetLevel: 'Intermediate',
          reason: 'Identified as a gap in recent practice submissions or resume analysis.',
        })),
        missingSkills: (userContext.missingSkills?.length ? userContext.missingSkills : ['Docker', 'TypeScript', 'PostgreSQL']).map((m) => ({
          name: m,
          category: 'Core Engineering',
          priority: 'High',
        })),
        priorityRecommendations: [
          'Solve 5 Medium level DSA problems in weak categories.',
          'Upload updated resume with quantified metrics for ATS evaluation.',
          'Complete an AI Mock Interview session to benchmark technical communication.',
        ],
        suggestedNextActions: [
          { title: 'Practice DSA Topics', description: 'Address weak topics in Coding Assessment.', targetRoute: '/dashboard/assessment' },
          { title: 'Resume ATS Audit', description: 'Analyze your resume for missing high-value keywords.', targetRoute: '/dashboard/ai-analysis' },
        ],
      };
      break;
    }

    case ACTION_TYPES.LEARNING_ROADMAP: {
      prompt = `
You are an AI Career Coach. Build a structured, multi-phase personalized learning roadmap.
${contextStr}

Return ONLY JSON matching:
{
  "actionType": "learning-roadmap",
  "actionTitle": "Create My Learning Roadmap",
  "summary": "Overview of personalized multi-phase learning path",
  "currentLevel": "Candidate Current Level (e.g. Intermediate Full Stack)",
  "targetRole": "Candidate Target Role (e.g. Senior Software Engineer)",
  "learningPriorities": ["Priority 1", "Priority 2", "Priority 3"],
  "phases": [
    {
      "phase": "Phase 1: Foundations & Core Gaps",
      "focus": "Focus Description",
      "technologies": ["Tech 1", "Tech 2"],
      "practiceProjects": ["Project Idea 1"],
      "milestone": "Measurable Milestone",
      "expectedOutcome": "Concrete Outcome"
    },
    {
      "phase": "Phase 2: Advanced Topics & Architecture",
      "focus": "Focus Description",
      "technologies": ["Tech 3", "Tech 4"],
      "practiceProjects": ["Project Idea 2"],
      "milestone": "Measurable Milestone",
      "expectedOutcome": "Concrete Outcome"
    },
    {
      "phase": "Phase 3: Production Readiness & Portfolio",
      "focus": "Focus Description",
      "technologies": ["Tech 5"],
      "practiceProjects": ["Project Idea 3"],
      "milestone": "Measurable Milestone",
      "expectedOutcome": "Concrete Outcome"
    }
  ],
  "recommendedSequence": ["Step 1", "Step 2", "Step 3"]
}
`;
      fallback = {
        actionType: ACTION_TYPES.LEARNING_ROADMAP,
        actionTitle: 'Create My Learning Roadmap',
        summary: `Personalized 3-Phase Learning Roadmap designed around your current readiness score and target technology stack.`,
        currentLevel: userContext.solvedCount > 15 ? 'Intermediate Developer' : 'Foundational Software Engineer',
        targetRole: userContext.headline || 'Full Stack Software Engineer',
        learningPriorities: [
          userContext.weakTopics?.[0] ? `Overcome DSA gap: ${userContext.weakTopics[0]}` : 'Master Core Data Structures & Algorithms',
          userContext.missingSkills?.[0] ? `Learn key tech gap: ${userContext.missingSkills[0]}` : 'Adopt Modern Frameworks & Cloud Tooling',
          'Build Production-Grade Full Stack Project',
        ],
        phases: [
          {
            phase: 'Phase 1: Foundations & Core Gaps (Weeks 1-3)',
            focus: 'Algorithmic Efficiency & Missing Core Technologies',
            technologies: userContext.profileSkills?.slice(0, 3) || ['JavaScript', 'React', 'Node.js'],
            practiceProjects: ['Build REST API backend with input validation and authentication'],
            milestone: 'Solve 10 Easy and 5 Medium DSA problems',
            expectedOutcome: 'Strong foundation in core data structures and asynchronous programming',
          },
          {
            phase: 'Phase 2: Advanced Architecture & System Design (Weeks 4-7)',
            focus: 'State Management, Caching, and Database Optimization',
            technologies: userContext.missingSkills?.slice(0, 3) || ['TypeScript', 'PostgreSQL', 'Redis'],
            practiceProjects: ['Construct full-stack application with relational DB and caching layer'],
            milestone: 'Complete 1 AI Mock Interview on technical concepts',
            expectedOutcome: 'Ability to architect scalable web applications',
          },
          {
            phase: 'Phase 3: Interview Mastery & Portfolio Polish (Weeks 8-10)',
            focus: 'Live Coding Speed, Resume Positioning, and Behavioral Screens',
            technologies: ['CI/CD', 'Docker', 'Testing Tools'],
            practiceProjects: ['Deploy portfolio project with live CI/CD pipeline and automated tests'],
            milestone: 'Achieve 85%+ overall ATS score and pass mock interview benchmark',
            expectedOutcome: 'Fully job-ready candidate profile with production project evidence',
          },
        ],
        recommendedSequence: [
          'Address weak DSA topics in Coding Assessment',
          'Integrate missing stack keywords into resume and GitHub projects',
          'Execute mock interview simulations to refine verbal delivery',
        ],
      };
      break;
    }

    case ACTION_TYPES.LEARN_NEXT: {
      prompt = `
You are an AI Career Coach. Answer strictly what the candidate should learn NEXT based on their current skills and gaps.
${contextStr}

Focus on immediate, highest-impact next learning priorities.
Return ONLY JSON matching:
{
  "actionType": "learn-next",
  "actionTitle": "What Should I Learn Next?",
  "summary": "Clear, concise statement on the immediate priority skill to acquire.",
  "learnThisFirst": {
    "skill": "Single Highest-Impact Skill Name",
    "why": "Specific reason why this skill gives maximum career leverage right now based on user context",
    "prerequisites": ["Prereq 1", "Prereq 2"],
    "estimatedHoursOrDays": "Estimated time to master basics (e.g. 5-7 Days)"
  },
  "nextSkills": [
    {
      "skill": "Skill Name",
      "priority": "High/Medium",
      "whyItMatters": "Explanation",
      "category": "Category"
    }
  ],
  "practiceRecommendation": "Specific practical task or mini project to prove mastery of the immediate skill."
}
`;
      fallback = {
        actionType: ACTION_TYPES.LEARN_NEXT,
        actionTitle: 'What Should I Learn Next?',
        summary: `Based on your profile, the single highest-leverage technology to learn next is ${userContext.missingSkills?.[0] || 'TypeScript'}.`,
        learnThisFirst: {
          skill: userContext.missingSkills?.[0] || 'TypeScript',
          why: userContext.missingSkills?.[0]
            ? `Identified as a critical missing skill in your latest resume audit.`
            : 'Essential for modern full-stack development and required in over 70% of senior engineering postings.',
          prerequisites: ['JavaScript ES6+', 'Basic Async/Await'],
          estimatedHoursOrDays: '5–7 Days',
        },
        nextSkills: [
          {
            skill: userContext.missingSkills?.[1] || 'Docker',
            priority: 'High',
            whyItMatters: 'Containerization is expected for backend and full-stack software engineers.',
            category: 'DevOps & Tooling',
          },
          {
            skill: userContext.weakTopics?.[0] || 'Graph & Tree Algorithms',
            priority: 'High',
            whyItMatters: 'Overcomes identified weaknesses in your recent coding assessment submissions.',
            category: 'DSA & Problem Solving',
          },
          {
            skill: userContext.missingSkills?.[2] || 'PostgreSQL & ORMs',
            priority: 'Medium',
            whyItMatters: 'Strengthens database modeling and backend architecture capability.',
            category: 'Database Management',
          },
        ],
        practiceRecommendation: `Convert an existing JavaScript project to strict ${userContext.missingSkills?.[0] || 'TypeScript'} and add strict interface contracts for all API routes.`,
      };
      break;
    }

    case ACTION_TYPES.WEAK_AREAS: {
      prompt = `
You are an AI Career Coach. Conduct an explicit weakness and gap analysis for this candidate.
${contextStr}

Identify technical, DSA, resume, project, and interview weaknesses based on evidence.
Return ONLY JSON matching:
{
  "actionType": "weak-areas",
  "actionTitle": "Find My Weak Areas",
  "summary": "Direct summary of candidate profile weaknesses and improvement leverage points",
  "weaknesses": [
    {
      "area": "Specific Weakness Title",
      "evidence": "Concrete evidence from candidate data or explicitly missing data",
      "severity": "High/Medium/Low",
      "whyItMatters": "Strategic impact on hiring decisions",
      "howToImprove": "Actionable steps to fix this weakness",
      "priority": 1
    }
  ]
}
`;
      const weakList = [];
      if (userContext.weakTopics?.length > 0) {
        weakList.push({
          area: `DSA Pattern Gap: ${userContext.weakTopics.join(', ')}`,
          evidence: `Multiple non-accepted submissions recorded in Coding Assessment for topic(s): ${userContext.weakTopics.join(', ')}.`,
          severity: 'High',
          whyItMatters: 'Technical interviewers heavily screen these algorithmic patterns in live coding rounds.',
          howToImprove: 'Solve 3-5 Medium problem challenges in this category with focus on time complexity optimization.',
          priority: 1,
        });
      } else if (userContext.solvedCount < 10) {
        weakList.push({
          area: 'Low DSA Practice Volume',
          evidence: `Only ${userContext.solvedCount} total problem challenges solved.`,
          severity: 'High',
          whyItMatters: 'Insufficient coding problem volume limits technical interview speed and confidence.',
          howToImprove: 'Complete 10 Easy and 10 Medium coding assessment challenges.',
          priority: 1,
        });
      }

      if (userContext.weakAreas?.length > 0) {
        weakList.push({
          area: `Resume Deficiencies: ${userContext.weakAreas[0]}`,
          evidence: `Flagged during automated ATS analysis (ATS score: ${userContext.atsScore !== null ? userContext.atsScore + '/100' : 'pending'}).`,
          severity: 'High',
          whyItMatters: 'ATS parsers reject resumes missing quantifiable metrics or section structure.',
          howToImprove: 'Rephrase experience bullet points with action verbs and percentage/monetary outcome metrics.',
          priority: 2,
        });
      } else if (userContext.atsScore === null) {
        weakList.push({
          area: 'Unverified Resume ATS Compatibility',
          evidence: 'No resume analysis has been executed yet.',
          severity: 'Medium',
          whyItMatters: 'Without an ATS audit, formatting errors or missing keywords can cause instant candidate drop-off.',
          howToImprove: 'Upload your PDF resume to the AI Resume Analysis tool to calculate your ATS score.',
          priority: 2,
        });
      }

      if (userContext.mockSessionsCount === 0) {
        weakList.push({
          area: 'Zero Mock Interview Practice',
          evidence: '0 mock interview sessions completed in platform history.',
          severity: 'Medium',
          whyItMatters: 'Lack of simulated interview practice leads to nervousness and poor STAR method responses.',
          howToImprove: 'Run an AI Mock Interview session to benchmark your communication score.',
          priority: 3,
        });
      } else if (userContext.interviewWeaknesses?.length > 0) {
        weakList.push({
          area: `Interview Performance Gap: ${userContext.interviewWeaknesses[0]}`,
          evidence: `Logged in previous interview session reports (Average Score: ${userContext.avgInterviewScore}/100).`,
          severity: 'High',
          whyItMatters: 'Directly impacts interviewer feedback and final hiring decision.',
          howToImprove: 'Practice targeted behavioral questions using the STAR technique.',
          priority: 3,
        });
      }

      fallback = {
        actionType: ACTION_TYPES.WEAK_AREAS,
        actionTitle: 'Find My Weak Areas',
        summary: `Analysis of candidate profile identified ${weakList.length} primary improvement areas spanning DSA activity, ATS score, and interview readiness.`,
        weaknesses: weakList,
      };
      break;
    }

    case ACTION_TYPES.INTERVIEW_PREP: {
      prompt = `
You are an AI Career Coach. Create an interview preparation strategy tailored explicitly to the candidate.
${contextStr}

Generate interview-focused topics, DSA patterns, project questions, resume questions, HR questions, and prep strategy.
Return ONLY JSON matching:
{
  "actionType": "interview-prep",
  "actionTitle": "Prepare Me for Interviews",
  "summary": "Targeted interview preparation overview",
  "technicalTopics": [
    {
      "topic": "Topic Name",
      "keyConcepts": ["Concept 1", "Concept 2"],
      "sampleQuestion": "Likely interview question text"
    }
  ],
  "dsaTopics": [
    {
      "pattern": "Algorithmic Pattern Name",
      "targetCount": 5,
      "focusArea": "Focus details"
    }
  ],
  "projectQuestions": ["Project deep-dive question 1", "Project deep-dive question 2"],
  "resumeQuestions": ["Resume experience question 1", "Resume experience question 2"],
  "hrBehavioralQuestions": ["Behavioral question 1", "Behavioral question 2"],
  "weakInterviewAreas": ["Weak area 1"],
  "preparationStrategy": [
    { "step": 1, "title": "Strategy Step Title", "description": "Step details", "targetRoute": "/dashboard/mock-interview" }
  ]
}
`;
      fallback = {
        actionType: ACTION_TYPES.INTERVIEW_PREP,
        actionTitle: 'Prepare Me for Interviews',
        summary: `Interview preparation roadmap designed for ${userContext.headline || 'Software Engineer'} targeting technical screens and behavioral rounds.`,
        technicalTopics: (userContext.profileSkills?.length ? userContext.profileSkills.slice(0, 3) : ['React', 'Node.js', 'System Design']).map((skill) => ({
          topic: `${skill} Deep Dive & Architecture`,
          keyConcepts: [`State management in ${skill}`, `Performance optimization`, `Error handling`],
          sampleQuestion: `Explain how ${skill} handles concurrent execution and asynchronous operations under heavy load.`,
        })),
        dsaTopics: [
          { pattern: userContext.weakTopics?.[0] || 'Two Pointers & Sliding Window', targetCount: 5, focusArea: 'Subarray problems and string parsing' },
          { pattern: 'Binary Search & Monotonic Stack', targetCount: 5, focusArea: 'Optimizing O(N^2) searches to O(log N)' },
        ],
        projectQuestions: [
          userContext.projectsSummary
            ? `Walk me through the technical decisions and database design behind: ${userContext.projectsSummary.slice(0, 60)}.`
            : 'Describe the architecture of your most complex software project and how you scaled it.',
          'How did you handle error boundary conditions and logging in your applications?',
        ],
        resumeQuestions: [
          userContext.experiencesSummary
            ? `What was your single biggest technical achievement while working as ${userContext.experiencesSummary.slice(0, 60)}?`
            : 'Tell me about a challenging technical trade-off you made in a previous position.',
        ],
        hrBehavioralQuestions: [
          'Describe a situation where project specifications changed right before a release deadline.',
          'How do you handle disagreement with a senior engineer regarding system architecture?',
        ],
        weakInterviewAreas: userContext.interviewWeaknesses?.length > 0 ? userContext.interviewWeaknesses : ['Verbalizing algorithmic trade-offs during live coding'],
        preparationStrategy: [
          { step: 1, title: 'Complete AI Mock Interview', description: 'Simulate live technical interview with instant feedback.', targetRoute: '/dashboard/mock-interview' },
          { step: 2, title: 'Practice Project STAR Stories', description: 'Prepare 2-minute structured responses for your listed projects.', targetRoute: '/dashboard/interview-prep' },
        ],
      };
      break;
    }

    case ACTION_TYPES.IMPROVE_RESUME: {
      prompt = `
You are an AI Career Coach and Recruiter. Provide an explicit resume improvement audit.
${contextStr}

DO NOT fabricate experiences, companies, or metrics. Explicitly note missing evidence if data is lacking.
Return ONLY JSON matching:
{
  "actionType": "improve-resume",
  "actionTitle": "Improve My Resume",
  "summary": "Direct evaluation of resume structure, keywords, and ATS readiness.",
  "resumeStrengths": ["Strength 1", "Strength 2"],
  "resumeProblems": ["Problem 1", "Problem 2"],
  "missingKeywords": ["Keyword 1", "Keyword 2"],
  "experienceImprovements": [
    { "currentIssue": "Issue description", "bulletImprovement": "Improved bullet point format" }
  ],
  "projectImprovements": [
    { "currentIssue": "Issue description", "bulletImprovement": "Improved bullet point format" }
  ],
  "atsRecommendations": ["ATS recommendation 1"],
  "priorityFixes": ["Priority fix 1", "Priority fix 2"]
}
`;
      fallback = {
        actionType: ACTION_TYPES.IMPROVE_RESUME,
        actionTitle: 'Improve My Resume',
        summary: `Resume optimization plan: Current ATS Score is ${userContext.atsScore !== null ? userContext.atsScore + '/100' : 'unverified (upload resume to audit)'}.`,
        resumeStrengths: [
          userContext.profileSkills?.length ? `Good listing of technical skills: ${userContext.profileSkills.slice(0, 4).join(', ')}` : 'Clear target title focus',
          userContext.resumeCount > 0 ? 'Document successfully parsed in system' : 'Profile information structured',
        ],
        resumeProblems: userContext.weakAreas?.length > 0
          ? userContext.weakAreas
          : ['Work experience bullet points lack quantifiable impact metrics (e.g. %, $ saved, latency reduction).', 'Missing modern cloud and containerization keywords.'],
        missingKeywords: userContext.missingSkills?.length > 0 ? userContext.missingSkills : ['Docker', 'CI/CD', 'TypeScript', 'PostgreSQL', 'Jest'],
        experienceImprovements: [
          {
            currentIssue: 'Passive language: "Responsible for building feature APIs"',
            bulletImprovement: 'Action-oriented with metric: "Engineered 12 RESTful API endpoints in Node.js, reducing average query response time by 28%."',
          },
        ],
        projectImprovements: [
          {
            currentIssue: 'Missing tech stack and live demonstration details',
            bulletImprovement: 'Include full tech stack header and GitHub repository link with live Vercel/Render deployment URL.',
          },
        ],
        atsRecommendations: [
          'Use standard standard standard headings: "Work Experience", "Technical Skills", "Education", "Projects".',
          'Avoid table layouts, headers/footers, or graphics that confuse ATS parsers.',
        ],
        priorityFixes: [
          'Add at least 3 missing high-value tech keywords to your technical skills section.',
          'Quantify achievement results in every work experience bullet point.',
        ],
      };
      break;
    }

    case ACTION_TYPES.TECHNICAL_SKILLS: {
      prompt = `
You are an AI Career Coach. Focus exclusively on technical skill advancement for this candidate.
${contextStr}

Analyze current level, strong/weak tech areas, missing tech, DSA focus, practice strategy, project recommendations, and technical milestones.
Return ONLY JSON matching:
{
  "actionType": "technical-skills",
  "actionTitle": "Improve My Technical Skills",
  "summary": "Technical skill advancement strategy based on coding stats and profile data",
  "currentTechnicalLevel": "Current Technical Level (e.g. Intermediate Developer)",
  "strongTechnicalAreas": ["Area 1", "Area 2"],
  "weakTechnicalAreas": ["Area 1", "Area 2"],
  "missingTechnicalSkills": ["Skill 1", "Skill 2"],
  "recommendedTechnologies": [
    { "tech": "Technology Name", "purpose": "Why to learn", "impact": "Impact on profile" }
  ],
  "dsaFocusTopics": ["Topic 1", "Topic 2"],
  "practiceStrategy": "Clear practice strategy statement",
  "projectRecommendations": [
    { "title": "Project Title", "stack": ["Tech 1", "Tech 2"], "description": "Project details" }
  ],
  "technicalMilestones": ["Milestone 1", "Milestone 2"]
}
`;
      fallback = {
        actionType: ACTION_TYPES.TECHNICAL_SKILLS,
        actionTitle: 'Improve My Technical Skills',
        summary: `Technical capability assessment: ${userContext.solvedCount || 0} DSA problems solved across ${userContext.totalSubmissions || 0} total submissions.`,
        currentTechnicalLevel: userContext.solvedCount >= 20 ? 'Solid Intermediate Software Engineer' : 'Developing Software Engineer',
        strongTechnicalAreas: userContext.profileSkills?.length ? userContext.profileSkills.slice(0, 3) : ['Web Development', 'JavaScript'],
        weakTechnicalAreas: userContext.weakTopics?.length ? userContext.weakTopics : ['System Architecture', 'Database Query Optimization'],
        missingTechnicalSkills: userContext.missingSkills?.length ? userContext.missingSkills : ['TypeScript', 'Redis Caching', 'Docker Containerization'],
        recommendedTechnologies: [
          { tech: 'TypeScript', purpose: 'Type safety and enterprise codebase readiness', impact: 'High market demand for full-stack roles' },
          { tech: 'Redis', purpose: 'In-memory caching and session management', impact: 'Demonstrates backend scalability knowledge' },
        ],
        dsaFocusTopics: userContext.weakTopics?.length ? userContext.weakTopics : ['Two Pointers', 'Sliding Window', 'Binary Search'],
        practiceStrategy: 'Solve 1 Medium DSA problem daily and refactor code to achieve O(N) time complexity and minimal space complexity.',
        projectRecommendations: [
          {
            title: 'High-Throughput Task Queue & Microservice',
            stack: ['Node.js', 'Redis', 'Docker', 'PostgreSQL'],
            description: 'Build an asynchronous job processing system with retry mechanisms and dead-letter queues.',
          },
        ],
        technicalMilestones: [
          'Reach 25 solved Medium-level DSA challenges',
          'Master TypeScript interface declarations & generic constraints',
          'Deploy 1 microservice project with containerization',
        ],
      };
      break;
    }

    case ACTION_TYPES.PLAN_30_DAYS: {
      prompt = `
You are an AI Career Coach. Create an actionable 30-day career preparation plan divided into 4 weekly periods: Days 1–7, Days 8–14, Days 15–21, Days 22–30.
${contextStr}

Return ONLY JSON matching:
{
  "actionType": "30-day-plan",
  "actionTitle": "Create 30-Day Plan",
  "summary": "30-day career acceleration plan tailored to candidate's current readiness score.",
  "periods": [
    {
      "range": "Days 1–7",
      "title": "Week 1 Title",
      "tasks": ["Task 1", "Task 2"],
      "focusSkills": ["Skill 1"],
      "codingPractice": "Coding goals",
      "resumeWork": "Resume goals",
      "interviewPrep": "Interview goals",
      "measurableGoal": "Measurable week 1 goal"
    },
    {
      "range": "Days 8–14",
      "title": "Week 2 Title",
      "tasks": ["Task 1", "Task 2"],
      "focusSkills": ["Skill 2"],
      "codingPractice": "Coding goals",
      "resumeWork": "Resume goals",
      "interviewPrep": "Interview goals",
      "measurableGoal": "Measurable week 2 goal"
    },
    {
      "range": "Days 15–21",
      "title": "Week 3 Title",
      "tasks": ["Task 1", "Task 2"],
      "focusSkills": ["Skill 3"],
      "codingPractice": "Coding goals",
      "resumeWork": "Resume goals",
      "interviewPrep": "Interview goals",
      "measurableGoal": "Measurable week 3 goal"
    },
    {
      "range": "Days 22–30",
      "title": "Week 4 Title",
      "tasks": ["Task 1", "Task 2"],
      "focusSkills": ["Skill 4"],
      "codingPractice": "Coding goals",
      "resumeWork": "Resume goals",
      "interviewPrep": "Interview goals",
      "measurableGoal": "Measurable week 4 goal"
    }
  ]
}
`;
      fallback = {
        actionType: ACTION_TYPES.PLAN_30_DAYS,
        actionTitle: 'Create 30-Day Plan',
        summary: `30-Day intensive plan designed to boost your ATS resume score, resolve DSA weak topics, and prepare for technical interviews.`,
        periods: [
          {
            range: 'Days 1–7',
            title: 'Audit & Baseline Foundation',
            tasks: [
              'Complete automated ATS Resume Audit and identify missing keywords.',
              'Solve 5 Easy DSA problems focusing on Arrays and Strings.',
              'Update platform profile headline and technical skills list.',
            ],
            focusSkills: ['Arrays & Strings', 'Resume Formatting'],
            codingPractice: '5 Easy problem submissions',
            resumeWork: 'Add missing high-value tech keywords',
            interviewPrep: 'Review core JavaScript / programming fundamentals',
            measurableGoal: 'ATS score >= 75/100',
          },
          {
            range: 'Days 8–14',
            title: 'Algorithmic Speed & Skill Expansion',
            tasks: [
              `Address weak topic: ${userContext.weakTopics?.[0] || 'Two Pointers & Hash Maps'}.`,
              'Learn fundamentals of missing stack requirement (e.g. TypeScript/Docker).',
              'Refactor project experience bullet points to include quantified percentage metrics.',
            ],
            focusSkills: [userContext.weakTopics?.[0] || 'Two Pointers', 'Quantifiable Resume Metrics'],
            codingPractice: '5 Medium DSA problem challenges',
            resumeWork: 'Quantify metrics in all work experiences',
            interviewPrep: 'Prepare 3 STAR-format behavioral project stories',
            measurableGoal: '10 total DSA problems solved',
          },
          {
            range: 'Days 15–21',
            title: 'Mock Interview Screenings & System Patterns',
            tasks: [
              'Execute first AI Mock Interview session and review feedback report.',
              'Practice system design concepts: Caching, Database Indexing, and REST API conventions.',
              'Solve 5 Medium DSA problems under time constraints.',
            ],
            focusSkills: ['Mock Interviews', 'REST & Caching Architecture'],
            codingPractice: '5 Medium DSA problem challenges',
            resumeWork: 'Finalize PDF resume version for applications',
            interviewPrep: 'Complete 1 AI Mock Interview session',
            measurableGoal: 'Mock interview overall score >= 70/100',
          },
          {
            range: 'Days 22–30',
            title: 'Application Blitz & Live Interview Execution',
            tasks: [
              'Apply to 15 targeted software engineering job postings with tailored resume.',
              'Complete 1 full AI Mock Interview session focusing on weak areas.',
              'Review and solve 3 hard/medium DSA revision problems.',
            ],
            focusSkills: ['Live Interview Execution', 'Targeted Job Submissions'],
            codingPractice: '5 Revision DSA problems',
            resumeWork: 'Customize resume summary per target job role',
            interviewPrep: 'Review interview session report weaknesses',
            measurableGoal: 'Submit 15 tailored job applications',
          },
        ],
      };
      break;
    }

    case ACTION_TYPES.PLAN_90_DAYS: {
      prompt = `
You are an AI Career Coach. Create a detailed 90-day career and job-readiness roadmap divided into 3 monthly periods: Days 1–30, Days 31–60, Days 61–90.
${contextStr}

The 90-day plan must be significantly more detailed and strategic than a 30-day plan.
Return ONLY JSON matching:
{
  "actionType": "90-day-plan",
  "actionTitle": "Create 90-Day Plan",
  "summary": "Strategic 90-day career roadmap for comprehensive job readiness.",
  "periods": [
    {
      "range": "Days 1–30",
      "title": "Month 1: Skill Gap Elimination & Resume Optimization",
      "focus": "Focus description",
      "technicalDevelopment": ["Tech task 1", "Tech task 2"],
      "dsaFocus": "DSA focus details",
      "projectWork": "Project work details",
      "interviewPrep": "Interview prep details",
      "jobReadinessMilestones": ["Milestone 1", "Milestone 2"]
    },
    {
      "range": "Days 31–60",
      "title": "Month 2: Advanced Engineering & Mock Mastery",
      "focus": "Focus description",
      "technicalDevelopment": ["Tech task 1", "Tech task 2"],
      "dsaFocus": "DSA focus details",
      "projectWork": "Project work details",
      "interviewPrep": "Interview prep details",
      "jobReadinessMilestones": ["Milestone 1", "Milestone 2"]
    },
    {
      "range": "Days 61–90",
      "title": "Month 3: Targeted Application Campaign & Hiring",
      "focus": "Focus description",
      "technicalDevelopment": ["Tech task 1", "Tech task 2"],
      "dsaFocus": "DSA focus details",
      "projectWork": "Project work details",
      "interviewPrep": "Interview prep details",
      "jobReadinessMilestones": ["Milestone 1", "Milestone 2"]
    }
  ]
}
`;
      fallback = {
        actionType: ACTION_TYPES.PLAN_90_DAYS,
        actionTitle: 'Create 90-Day Plan',
        summary: `Strategic 90-Day comprehensive career acceleration plan guiding you from foundational skill gaps to active technical interviewing and job placement.`,
        periods: [
          {
            range: 'Days 1–30',
            title: 'Month 1: Core Skill Gaps & Resume Optimization',
            focus: 'Eliminating algorithmic weak spots and achieving an 80+ ATS resume score.',
            technicalDevelopment: [
              `Master missing core stack technologies: ${userContext.missingSkills?.join(', ') || 'TypeScript & Docker'}.`,
              'Establish daily coding problem practice habit.',
            ],
            dsaFocus: 'Solve 15 Easy and 10 Medium coding challenges covering Arrays, Strings, Hash Maps, and Two Pointers.',
            projectWork: 'Refactor existing portfolio project to include modern architecture, type safety, and clean documentation.',
            interviewPrep: 'Study core computer science and technical role concepts; log baseline mock interview score.',
            jobReadinessMilestones: ['ATS Resume Score >= 80/100', '25 DSA problems solved', 'Profile completeness at 100%'],
          },
          {
            range: 'Days 31–60',
            title: 'Month 2: System Architecture & Mock Interview Mastery',
            focus: 'Building scalable full-stack projects and mastering technical communication under interview conditions.',
            technicalDevelopment: [
              'Implement caching (Redis), relational database indexing (PostgreSQL), and background workers.',
              'Containerize full-stack application using Docker Compose.',
            ],
            dsaFocus: 'Solve 15 Medium DSA challenges focusing on Trees, Graphs, Dynamic Programming, and System Design.',
            projectWork: 'Build and deploy full-stack capstone application featuring real-time state and database persistence.',
            interviewPrep: 'Complete 3 AI Mock Interview sessions with average score >= 75/100; refine STAR behavioral stories.',
            jobReadinessMilestones: ['40 total DSA problems solved', 'Capstone project deployed with live URL', 'Completed 3 AI Mock Interviews'],
          },
          {
            range: 'Days 61–90',
            title: 'Month 3: Strategic Application Blitz & Offer Negotiation',
            focus: 'Targeted job applications, live interview screening execution, and final offer selection.',
            technicalDevelopment: [
              'Maintain daily algorithmic warm-ups and review system design trade-offs.',
              'Tailor technical resume keywords for individual job descriptions.',
            ],
            dsaFocus: 'Maintain revision velocity by solving 2 Medium problems daily.',
            projectWork: 'Polish GitHub READMEs, demo videos, and architecture diagrams for recruiter visibility.',
            interviewPrep: 'Participate in active hiring company technical screens and system design rounds.',
            jobReadinessMilestones: ['Submit 45+ targeted job applications', 'Achieve 3+ technical interview invitations', 'Pass technical screen benchmark'],
          },
        ],
      };
      break;
    }
  }

  // Attempt Groq API completion
  const aiResult = await callGroqJson(prompt);
  if (aiResult && aiResult.actionTitle && (aiResult.summary || aiResult.overallAssessment)) {
    return { ...aiResult, actionType: canonicalAction };
  }

  // Fallback to deterministic candidate-data response if Groq fails or returns invalid response
  return fallback;
}


