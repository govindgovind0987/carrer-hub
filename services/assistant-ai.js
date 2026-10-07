import { Groq } from 'groq-sdk';
import { prisma } from '../lib/prisma.js';
import { checkCareerHubScope } from './assistant-scope.js';
import {
  CAREERHUB_ROUTES,
  searchCodingProblems,
  getCodingProblem,
  getUserSubmission,
  getInterviewSession,
  getInterviewQuestion,
  getInterviewReport,
  getUserResume,
  getATSScore,
  getUserProfile,
  getLearningProgress,
  getJobMatches,
} from './assistant-tools.js';

const CANDIDATE_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
];

let activeWorkingModel = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  try {
    return new Groq({ apiKey });
  } catch (err) {
    console.error('Failed to instantiate Groq client:', err);
    return null;
  }
}

/**
 * Intelligent context gatherer based on user's query and current page context.
 * Strictly user-scoped to authenticated userId.
 */
async function gatherAssistantContext(query, currentContext = {}, userId) {
  const contextData = {};
  const lowerQuery = query.toLowerCase();

  // 1. Current Page Context (Passed from client)
  if (currentContext && Object.keys(currentContext).length > 0) {
    contextData.activePageContext = currentContext;
  }

  // 2. DSA / Coding Problem Lookup
  const isProblemRelated =
    lowerQuery.includes('problem') ||
    lowerQuery.includes('solution') ||
    lowerQuery.includes('two sum') ||
    lowerQuery.includes('binary search') ||
    lowerQuery.includes('code') ||
    lowerQuery.includes('dsa') ||
    lowerQuery.includes('failing') ||
    lowerQuery.includes('complexity') ||
    currentContext?.problemId ||
    currentContext?.problemTitle;

  if (isProblemRelated) {
    // If on active problem page, problem context is already in currentContext.
    // If asking about a specific named problem, look it up in DB
    const problemNameMatch = query.match(/(?:problem|solution for|explain|about)\s+["']?([a-zA-Z0-9\s\-]+?)["']?(?:\?|$|\.|\n)/i);
    const searchTarget = problemNameMatch ? problemNameMatch[1].trim() : query;

    if (currentContext?.problemSlug || currentContext?.problemTitle) {
      const probRes = await getCodingProblem(currentContext.problemSlug || currentContext.problemTitle);
      if (probRes.success) contextData.activeDatabaseProblem = probRes.problem;
    } else if (searchTarget && searchTarget.length > 2) {
      const searchRes = await searchCodingProblems(searchTarget, { limit: 3 });
      if (searchRes.success && searchRes.problems.length > 0) {
        // Fetch full details of best match
        const fullProb = await getCodingProblem(searchRes.problems[0].slug);
        if (fullProb.success) contextData.matchedProblem = fullProb.problem;
        contextData.searchResults = searchRes.problems;
      }
    }

    // If asking about failing code and user is logged in
    if (userId && (lowerQuery.includes('fail') || lowerQuery.includes('error') || lowerQuery.includes('my code') || lowerQuery.includes('submission'))) {
      const subRes = await getUserSubmission(userId, {
        problemId: currentContext?.problemId,
        problemSlug: currentContext?.problemSlug,
        limit: 3,
      });
      if (subRes.success && subRes.submissions.length > 0) {
        contextData.userRecentSubmissions = subRes.submissions;
      }
    }
  }

  // 3. Mock Interview Data
  const isInterviewRelated =
    lowerQuery.includes('interview') ||
    lowerQuery.includes('mock') ||
    lowerQuery.includes('answer marked wrong') ||
    lowerQuery.includes('question') ||
    currentContext?.pageType === 'interview';

  if (isInterviewRelated && userId) {
    if (lowerQuery.includes('question') && (lowerQuery.includes('1') || lowerQuery.includes('2') || lowerQuery.includes('3') || lowerQuery.includes('4') || lowerQuery.includes('5'))) {
      const numMatch = lowerQuery.match(/\b([1-5])\b/);
      const qIndex = numMatch ? parseInt(numMatch[1], 10) - 1 : 0;
      const qRes = await getInterviewQuestion(userId, { questionIndex: qIndex });
      if (qRes.success) contextData.interviewQuestionDetail = qRes.question;
    } else {
      const sessRes = await getInterviewSession(userId);
      if (sessRes.success) contextData.latestInterviewSession = sessRes.session;
    }

    if (lowerQuery.includes('report') || lowerQuery.includes('score') || lowerQuery.includes('feedback')) {
      const repRes = await getInterviewReport(userId);
      if (repRes.success) contextData.interviewReport = repRes.report;
    }
  }

  // 4. Resume & ATS Data
  const isResumeRelated =
    lowerQuery.includes('resume') ||
    lowerQuery.includes('ats') ||
    lowerQuery.includes('summary') ||
    lowerQuery.includes('missing skills') ||
    currentContext?.pageType === 'resume';

  if (isResumeRelated && userId) {
    const [atsRes, resumeRes] = await Promise.all([
      getATSScore(userId),
      getUserResume(userId),
    ]);
    if (atsRes.success) contextData.atsAnalysis = atsRes.analysis;
    if (resumeRes.success) contextData.resumes = resumeRes.resumes;
  }

  // 5. Profile & Learning & Skills
  const isProfileOrSkillRelated =
    lowerQuery.includes('profile') ||
    lowerQuery.includes('skill') ||
    lowerQuery.includes('learn') ||
    lowerQuery.includes('roadmap') ||
    lowerQuery.includes('progress') ||
    lowerQuery.includes('streak');

  if (isProfileOrSkillRelated && userId) {
    const [profRes, learnRes] = await Promise.all([
      getUserProfile(userId),
      getLearningProgress(userId),
    ]);
    if (profRes.success) contextData.userProfile = profRes.profile;
    if (learnRes.success) contextData.learningProgress = learnRes.learningProgress;
  }

  // 6. Navigation Routes Reference
  if (lowerQuery.includes('where') || lowerQuery.includes('navigate') || lowerQuery.includes('open') || lowerQuery.includes('how do i find') || lowerQuery.includes('go to')) {
    contextData.availableRoutes = CAREERHUB_ROUTES;
  }

  return contextData;
}

/**
 * Builds the strict, contextual system prompt for CareerHub AI Assistant.
 */
function buildSystemPrompt(contextData) {
  return `You are the official CareerHub AI Assistant, an elite artificial intelligence engineering and career coach built exclusively for the CareerHub platform.

MISSION & BEHAVIORAL RULES:
1. STRICT CAREERHUB SCOPE:
   - You MUST ONLY answer questions directly related to CareerHub, software engineering, Data Structures & Algorithms (DSA), coding problems, technical & HR interviews, resumes & ATS optimization, career roadmaps, skill analytics, and CareerHub navigation.
   - If the user asks about ANY unrelated topic (e.g., weather, politics, government leaders, celebrity gossip, movies, sports scores, creative stories, jokes, recipes), you MUST politely refuse using this standard tone:
     "I can help only with CareerHub-related questions such as coding, DSA, interviews, resumes, career preparation, learning progress, and CareerHub features."
   - Technical and software engineering concepts (e.g. binary search, React useEffect, REST APIs, time/space complexity, system design, microservices, databases) ARE strictly IN-SCOPE because they are essential to CareerHub's coding and interview mission.

2. DSA & CODING PROBLEM EXPERTISE:
   - CareerHub features a platform database of 1500+ coding challenges.
   - When asked about a specific problem (e.g., Two Sum, Binary Search, Sliding Window):
     * Explain the problem clearly with intuition.
     * Describe optimal approach & algorithm.
     * Provide exact Big-O Time Complexity and Space Complexity.
     * Provide clean, working code in the requested language (support Python, Java, and C++).
     * NEVER invent an imaginary problem when database problem information is provided in the context below.

3. ACTIVE PROBLEM & SUBMISSION CONTEXT:
   - If the user is on a problem workspace and asks why their solution is failing, analyze their ACTUAL submitted code, input constraints, edge cases, and runtime/memory errors from the provided context. Give targeted debugging advice without being vague.

4. MOCK INTERVIEWS & RESUMES:
   - If the user asks about their mock interviews, questions, transcripts, or answers marked wrong, refer strictly to their authentic session data provided in context. Never fabricate answers or assumptions.
   - If the user asks about their resume or ATS score, refer directly to their ATS analysis, scores, strong/weak areas, and missing keywords in context.

5. INTERNAL PLATFORM NAVIGATION:
   - When the user asks where a feature is located or how to reach a page, always provide exact markdown links using CareerHub routes:
     * Coding Practice / Problems: [Go to Coding Assessment](/dashboard/assessment)
     * Coding Leaderboard: [View Leaderboard](/dashboard/assessment/leaderboard)
     * AI Mock Interviews: [Open AI Mock Interview](/dashboard/mock-interview)
     * My Workspace: [Open My Workspace](/dashboard/career-workspace)
     * My Resumes: [View My Resumes](/dashboard/resumes)
     * Resume ATS Score: [Check AI Resume Score](/dashboard/ai-analysis)
     * Job Matches: [Explore AI Job Matcher](/dashboard/job-match)
     * Career Coach: [Consult AI Career Coach](/dashboard/career-coach)
     * Learning Roadmap: [View My Learning](/dashboard/learning)
     * Skill Progress: [Check Skill Progress](/dashboard/skill-progress)
     * Candidate Profile: [Edit My Profile](/dashboard/profile)
     * Settings: [Account Settings](/dashboard/settings)
   - NEVER invent nonexistent URLs. Only use the routes specified above.

6. FORMATTING:
   - Use clean GitHub-flavored markdown.
   - Use clear headings, bullet points, and syntax-highlighted code blocks with language identifiers (\`\`\`python, \`\`\`java, \`\`\`cpp, \`\`\`javascript).
   - Be professional, encouraging, technical, and precise.

=== CURRENT AUTHENTIC CAREERHUB CONTEXT ===
${JSON.stringify(contextData, null, 2)}
==========================================`;
}

/**
 * Streams AI response using Groq with candidate model fallback.
 */
export async function streamCareerHubAssistant({
  messages,
  currentContext = {},
  userId = null,
  onToken,
  onComplete,
  onError,
}) {
  const groq = getGroqClient();
  if (!groq) {
    const err = new Error('CareerHub AI is temporarily unavailable. Please try again.');
    onError?.(err);
    return;
  }

  // Check the latest user message for out-of-scope intent
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const userPrompt = lastUserMessage?.content || '';

  const scopeCheck = checkCareerHubScope(userPrompt);
  if (scopeCheck.isOutOfScope) {
    const refusal = scopeCheck.refusalMessage;
    onToken?.(refusal);
    onComplete?.(refusal);
    return;
  }

  // Gather server-side database context scoped to userId
  const contextData = await gatherAssistantContext(userPrompt, currentContext, userId);
  const systemPrompt = buildSystemPrompt(contextData);

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-8).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  ];

  // Try active working model or candidate models
  const modelsToTry = activeWorkingModel
    ? [activeWorkingModel, ...CANDIDATE_MODELS.filter((m) => m !== activeWorkingModel)]
    : CANDIDATE_MODELS;

  let streamSucceeded = false;

  for (const model of modelsToTry) {
    try {
      const stream = await groq.chat.completions.create({
        model,
        messages: formattedMessages,
        temperature: 0.25,
        max_tokens: 1800,
        stream: true,
      });

      activeWorkingModel = model;
      let fullContent = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          onToken?.(delta);
        }
      }

      streamSucceeded = true;
      onComplete?.(fullContent);

      // Asynchronously log to AIHistory for session tracking
      if (userId) {
        prisma.aIHistory
          .create({
            data: {
              userId,
              type: 'CHATBOT',
              inputData: { prompt: userPrompt.slice(0, 500), contextRef: currentContext?.pageType || 'general' },
              outputData: { responseSummary: fullContent.slice(0, 500), model },
            },
          })
          .catch(() => {});
      }

      break;
    } catch (err) {
      console.warn(`Model ${model} streaming error:`, err?.message || err);
      // Try next candidate model
    }
  }

  if (!streamSucceeded) {
    const fallbackError = new Error('CareerHub AI is temporarily unavailable. Please try again.');
    onError?.(fallbackError);
  }
}
