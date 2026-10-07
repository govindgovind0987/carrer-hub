import { callGroqJson } from './ai.js';

/**
 * Supported technologies in CareerHub Mock Interview Platform
 */
export const SUPPORTED_TECHNOLOGIES = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'Prisma',
  'HTML',
  'CSS',
  'Tailwind',
  'REST API',
  'Git',
  'GitHub',
  'Docker',
  'System Design',
  'Operating System',
  'Computer Networks',
  'DBMS',
  'OOP',
  'DSA',
  'General Programming',
];

/**
 * Generate complete Mock Interview Questions Session dynamically with Groq AI.
 * Incorporates candidate profile, previous performance, and avoids repeating past questions.
 */
export async function generateInterviewSessionAI({
  role = 'Full Stack Engineer',
  technology = 'React',
  category = 'Technical',
  companyStyle = 'General Interview',
  experience = 'MID_LEVEL',
  difficulty = 'MEDIUM',
  type = 'Technical Interview',
  durationMinutes = 30,
  numberOfQuestions = 5,
  questionCategories = ['TECHNICAL'],
  candidateProfile = null,
  previousPerformance = null,
  previousQuestions = [],
}) {
  const selectedTechOrCat = category || technology || 'Technical';
  const count = Math.min(10, Math.max(1, Number(numberOfQuestions) || 5));

  // Build candidate context string if profile exists
  let candidateContext = '';
  if (candidateProfile) {
    const skills = Array.isArray(candidateProfile.skills)
      ? candidateProfile.skills.map((s) => s.name).join(', ')
      : '';
    const headline = candidateProfile.headline || '';
    const expYears = candidateProfile.experience ? `${candidateProfile.experience} years` : '';
    candidateContext = `
Candidate Profile Context:
- Headline: ${headline || 'Not specified'}
- Stated Skills: ${skills || 'General'}
- Experience: ${expYears || experience}
`;
  }

  // Build past performance / weak areas context if available
  let performanceContext = '';
  if (previousPerformance && Array.isArray(previousPerformance) && previousPerformance.length > 0) {
    const weaknesses = previousPerformance.flatMap((p) => p.weaknesses || []).filter(Boolean);
    const missing = previousPerformance.flatMap((p) => p.missingConcepts || []).filter(Boolean);
    if (weaknesses.length > 0 || missing.length > 0) {
      performanceContext = `
Candidate Recent Growth Gaps (test these if relevant):
- Prior Weak Areas: ${weaknesses.slice(0, 5).join('; ') || 'None'}
- Missing Concepts: ${missing.slice(0, 5).join('; ') || 'None'}
`;
    }
  }

  // Anti-duplication negative constraint
  let antiDuplicateConstraint = '';
  if (Array.isArray(previousQuestions) && previousQuestions.length > 0) {
    const samplePast = previousQuestions.slice(0, 25).map((q) => `"${q}"`).join(', ');
    antiDuplicateConstraint = `
CRITICAL DIVERSITY REQUIREMENT:
The candidate was previously asked these questions: [${samplePast}].
Do NOT repeat or closely rephrase any of the above questions. Generate completely FRESH, novel questions probing different aspects.
`;
  }

  const prompt = `
You are an elite Senior Staff Engineer and Lead Hiring Manager at a top-tier tech company.
Generate an interview question set with EXACTLY ${count} unique, realistic questions tailored for:
- Target Job Role: ${role}
- Primary Tech Stack: ${selectedTechOrCat}
- Interview Type: ${type}
- Target Experience Level: ${experience}
- Difficulty Level: ${difficulty}
- Session Duration: ${durationMinutes} minutes
- Question Count: ${count}
- Company Style: ${companyStyle}
${candidateContext}
${performanceContext}
${antiDuplicateConstraint}

INTERVIEW STRUCTURE & QUESTION DISTRIBUTION GUIDELINES:
Determine a realistic mixture of questions appropriate for the "${type}" and "${role}":
1. If "Technical Interview":
   - Focus on ${selectedTechOrCat} core internals, asynchronous programming, system patterns, production debugging, performance, and architecture.
   - Include 1 behavioral or situational question assessing collaboration and trade-off decisions.
2. If "HR Interview" or "Behavioral Interview":
   - Focus on culture fit, career trajectory, team collaboration, conflict resolution, handling failure, navigating ambiguity, and ownership (STAR format).
   - Assess communication, maturity, and emotional intelligence.
3. If "System Design Interview":
   - Focus on high-level architecture, scalability, database selection (SQL vs NoSQL), caching, microservices, load balancing, fault tolerance, and trade-offs.
4. If "Coding Interview":
   - Include hands-on algorithmic and coding problems (with a starter code template) and time/space complexity analysis.
5. If "Mixed Interview" or General:
   - Provide a realistic full-loop interview: ${selectedTechOrCat} technical deep-dive + system architecture + 1 coding/logic problem + 1 behavioral STAR question.

QUESTION TYPE SPECIFICATION:
Distribute the "questionType" field realistically across:
- "TEXT" (detailed verbal/conceptual explanation)
- "CODE" (hands-on coding problem requiring implementation, must include "codeTemplate")
- "VOICE" (high-level architectural or design explanation suitable for voice)
- "PARAGRAPH" (situational or behavioral STAR scenario)
- "MULTIPLE_CHOICE" (precise technical multiple choice with 4 "options")

SCHEMA REQUIREMENTS:
Return valid JSON ONLY with key "questions".
Array length must be EXACTLY ${count}.
Do NOT output markdown backticks or extra text outside JSON.

JSON Schema:
{
  "questions": [
    {
      "question": "Question text...",
      "category": "TECHNICAL | HR | BEHAVIORAL | DSA | JAVASCRIPT | REACT | NODEJS | SQL",
      "categoryName": "Specific sub-topic name (e.g. React Concurrent Mode, Conflict Resolution, Database Sharding)",
      "difficulty": "EASY | MEDIUM | HARD",
      "questionType": "TEXT | CODE | VOICE | PARAGRAPH | MULTIPLE_CHOICE",
      "expectedConcepts": ["Core concept 1", "Core concept 2", "Core concept 3"],
      "sampleAnswer": "Comprehensive summary of expected answer...",
      "explanation": "Deep technical explanation of the underlying concepts and why they matter in production...",
      "bestAnswer": "Ideal enterprise model answer demonstrating mastery and best practices...",
      "alternativeAnswer": "Alternative approach, trade-off, or different architectural perspective...",
      "commonMistakes": ["Common candidate mistake 1", "Common candidate mistake 2"],
      "followUp": "Thought-provoking follow-up question the interviewer would ask...",
      "interviewTips": ["Actionable advice on how to structure response (e.g. STAR framework)", "Trade-offs to mention"],
      "keyPoints": ["Key point 1", "Key point 2"],
      "options": ["Option A", "Option B", "Option C", "Option D"] (null if not MULTIPLE_CHOICE),
      "codeTemplate": "// starter code (null if not CODE)"
    }
  ]
}
`;

  try {
    const result = await callGroqJson(prompt);

    if (result && Array.isArray(result.questions) && result.questions.length > 0) {
      let mapped = result.questions.map((q, idx) => {
        const qType = (q.questionType || (idx % 3 === 2 ? 'CODE' : 'TEXT')).toUpperCase();
        const expectedConcepts = Array.isArray(q.expectedConcepts) && q.expectedConcepts.length > 0
          ? q.expectedConcepts
          : Array.isArray(q.keyPoints) && q.keyPoints.length > 0
            ? q.keyPoints
            : [selectedTechOrCat, 'Architecture', 'Trade-offs'];

        return {
          order: idx + 1,
          question: q.question || `Explain core design patterns in ${selectedTechOrCat} for a ${role}.`,
          category: normalizeCategoryString(q.category || selectedTechOrCat),
          categoryName: q.categoryName || q.category || selectedTechOrCat,
          difficulty: normalizeDifficultyString(q.difficulty || difficulty),
          role,
          companyStyle,
          questionType: qType,
          expectedConcepts,
          sampleAnswer: q.sampleAnswer || q.bestAnswer || 'Provide a structured response detailing architectural choices and production trade-offs.',
          explanation: q.explanation || q.sampleAnswer || 'Technical breakdown of underlying engineering principles.',
          bestAnswer: q.bestAnswer || q.sampleAnswer || 'Model answer demonstrating production standard practices.',
          alternativeAnswer: q.alternativeAnswer || 'Alternative architectural pattern or trade-off consideration.',
          commonMistakes: Array.isArray(q.commonMistakes) && q.commonMistakes.length > 0
            ? q.commonMistakes
            : ['Did not address scale limitations', 'Overlooked error recovery boundaries'],
          followUp: q.followUp || `How would you monitor and optimize this for high traffic in ${selectedTechOrCat}?`,
          interviewTips: Array.isArray(q.interviewTips) && q.interviewTips.length > 0
            ? q.interviewTips
            : ['Structure your response clearly with practical real-world examples.', 'Address trade-offs directly.'],
          hints: Array.isArray(q.interviewTips) && q.interviewTips.length > 0
            ? q.interviewTips
            : ['Highlight practical real-world trade-offs.'],
          keyPoints: expectedConcepts,
          options: Array.isArray(q.options) && q.options.length > 0 ? q.options : null,
          codeTemplate: q.codeTemplate || (qType === 'CODE' ? `// Implementation for ${role} in ${selectedTechOrCat}\nfunction solution() {\n  // TODO: implement logic\n}\n` : null),
        };
      });

      return mapped.slice(0, count);
    }
    return null;
  } catch (err) {
    console.error('Groq AI Question Generation Error:', err);
    return null;
  }
}

function normalizeCategoryString(cat) {
  if (!cat) return 'TECHNICAL';
  const clean = String(cat).toUpperCase().replace(/[^A-Z]/g, '');
  const valid = ['JAVASCRIPT', 'REACT', 'NEXTJS', 'NODEJS', 'MONGODB', 'SQL', 'DSA', 'HR', 'BEHAVIORAL', 'TECHNICAL'];
  if (valid.includes(clean)) return clean;
  if (clean.includes('REACT')) return 'REACT';
  if (clean.includes('NEXT')) return 'NEXTJS';
  if (clean.includes('NODE')) return 'NODEJS';
  if (clean.includes('MONGO')) return 'MONGODB';
  if (clean.includes('SQL')) return 'SQL';
  if (clean.includes('DSA') || clean.includes('ALGO')) return 'DSA';
  if (clean.includes('HR')) return 'HR';
  if (clean.includes('BEHAVIOR')) return 'BEHAVIORAL';
  if (clean.includes('JS') || clean.includes('JAVASCRIPT')) return 'JAVASCRIPT';
  return 'TECHNICAL';
}

function normalizeDifficultyString(diff) {
  if (!diff) return 'MEDIUM';
  const clean = String(diff).toUpperCase();
  if (clean === 'EASY' || clean === 'MEDIUM' || clean === 'HARD') return clean;
  if (clean.includes('EASY')) return 'EASY';
  if (clean.includes('HARD')) return 'HARD';
  return 'MEDIUM';
}

/**
 * Evaluate candidate's interview answer using Groq AI.
 * Performs deep semantic, architectural, and communicative evaluation (NOT keyword matching).
 * Provides strict structured status: CORRECT | PARTIALLY_CORRECT | INCORRECT | NOT_ANSWERED.
 */
export async function evaluateInterviewAnswerAI({
  question,
  userAnswer = '',
  answerType = 'TEXT',
  codeSnippet = '',
  confidenceScore = 0.8,
  timeTakenSec = 60,
  role = 'Software Engineer',
  technology = 'General',
  experience = 'MID_LEVEL',
  interviewType = 'Technical Interview',
}) {
  const answerText = (userAnswer || codeSnippet || '').trim();
  const qText = question?.question || 'Question';
  const qCategory = question?.category || 'TECHNICAL';
  const expectedConcepts = Array.isArray(question?.expectedConcepts) && question.expectedConcepts.length > 0
    ? question.expectedConcepts.join(', ')
    : Array.isArray(question?.keyPoints) && question.keyPoints.length > 0
      ? question.keyPoints.join(', ')
      : 'Technical accuracy, clear reasoning, and production trade-offs';
  const modelAnswer = question?.bestAnswer || question?.sampleAnswer || '';

  // 1. Handle completely blank / unanswered questions immediately
  // NEVER send empty answers to AI or mark them as partially correct
  if (!answerText) {
    return {
      status: 'NOT_ANSWERED',
      verdict: 'NOT_ANSWERED',
      score: 0,
      confidence: 0,
      correctness: 0,
      technicalKnowledge: 0,
      communication: 0,
      problemSolving: 0,
      codingStyle: 0,
      cleanCode: 0,
      bestPractices: 0,
      logicalThinking: 0,
      strengths: [],
      missingConcepts: Array.isArray(question?.expectedConcepts) && question.expectedConcepts.length > 0
        ? question.expectedConcepts
        : Array.isArray(question?.keyPoints) && question.keyPoints.length > 0
          ? question.keyPoints
          : ['Response was not provided'],
      mistakes: ['No answer was provided for this question.'],
      idealAnswer: modelAnswer || 'A structured enterprise response clearly addressing the core question requirements.',
      feedback: 'No answer was provided for this question.',
    };
  }

  const isHR = qCategory === 'HR' || qCategory === 'BEHAVIORAL' || interviewType.toLowerCase().includes('hr') || interviewType.toLowerCase().includes('behavior');
  const isCoding = qCategory === 'DSA' || answerType === 'CODE' || interviewType.toLowerCase().includes('coding');

  const prompt = `
You are an expert technical interviewer and executive talent evaluator conducting an AI mock interview.
Evaluate the candidate's response to the following interview question with high rigor.

EVALUATION CONTEXT:
- Candidate Role: ${role}
- Tech Stack: ${technology}
- Target Experience Level: ${experience}
- Interview Type: ${interviewType}
- Question Category: ${qCategory}
- Question Type: ${answerType}
- Original Question: "${qText}"
- Expected Key Concepts: ${expectedConcepts}
- Ideal Benchmark Model Answer: "${modelAnswer}"
- Candidate Answer Submitted:
"""
${answerText}
"""
${codeSnippet ? `Candidate Code Submitted:\n"""\n${codeSnippet}\n"""\n` : ''}
- Time Spent: ${timeTakenSec} seconds
- Speech Confidence: ${confidenceScore}

EVALUATION GUIDELINES:
1. SEMANTIC & SUBSTANTIVE UNDERSTANDING (DO NOT USE KEYWORD MATCHING):
   - Do NOT evaluate answers using simple keyword matching. Understand the actual meaning and depth of the candidate's explanation.
2. TECHNICAL QUESTIONS:
   - Evaluate correctness, technical accuracy, completeness, reasoning, relevant concepts, practical understanding, and mistakes.
3. CODING QUESTIONS:
   - Evaluate algorithmic approach, correctness, time and space complexity, edge cases, and implementation reasoning.
4. HR & BEHAVIORAL QUESTIONS:
   - Evaluate relevance, clarity, structure (e.g. STAR method), communication, specific actions, outcomes, and emotional intelligence.
   - Do NOT mark a good HR answer "incorrect" just because it lacks technical keywords.
5. STRICT STRUCTURED STATUS & SCORING:
   - "CORRECT": The answer is accurate, comprehensive, and demonstrates solid mastery (Score 80-100).
   - "PARTIALLY_CORRECT": The answer touches on good points but has meaningful gaps, missed important considerations, or minor inaccuracies (Score 50-79).
   - "INCORRECT": The answer is fundamentally flawed, off-topic, or demonstrates significant misconceptions (Score 1-49).
   - Clamp score strictly between 0 and 100. Never output arbitrary or default numbers.

SCHEMA REQUIREMENTS:
Return valid raw JSON strictly matching:
{
  "status": "CORRECT | PARTIALLY_CORRECT | INCORRECT",
  "score": 85,
  "confidence": 85,
  "correctness": 85,
  "technicalKnowledge": 90,
  "communication": 80,
  "problemSolving": 85,
  "codingStyle": 80,
  "cleanCode": 85,
  "bestPractices": 85,
  "logicalThinking": 90,
  "strengths": ["Specific strength demonstrated in the candidate's answer"],
  "missingConcepts": ["Important concepts or considerations the candidate omitted"],
  "mistakes": ["Specific technical or logical errors made, or empty if none"],
  "feedback": "2-3 paragraphs of constructive, clear coaching feedback analyzing the answer...",
  "idealAnswer": "Clear, comprehensive benchmark model answer demonstrating best practices..."
}
`;

  try {
    const result = await callGroqJson(prompt);

    if (result && typeof result.score === 'number' && !isNaN(result.score)) {
      const clampedScore = Math.min(100, Math.max(0, Math.round(Number(result.score))));

      let finalStatus = String(result.status || result.verdict || '').toUpperCase();
      if (!['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT'].includes(finalStatus)) {
        finalStatus = clampedScore >= 80 ? 'CORRECT' : clampedScore >= 50 ? 'PARTIALLY_CORRECT' : 'INCORRECT';
      }

      return {
        status: finalStatus,
        verdict: finalStatus,
        score: clampedScore,
        confidence: Math.min(100, Math.max(0, Math.round(Number(result.confidence) || (clampedScore > 0 ? 80 : 0)))),
        correctness: Math.min(100, Math.max(0, Math.round(Number(result.correctness) || clampedScore))),
        technicalKnowledge: Math.min(100, Math.max(0, Math.round(Number(result.technicalKnowledge) || clampedScore))),
        communication: Math.min(100, Math.max(0, Math.round(Number(result.communication) || (clampedScore > 0 ? clampedScore : 0)))),
        problemSolving: Math.min(100, Math.max(0, Math.round(Number(result.problemSolving) || clampedScore))),
        codingStyle: Math.min(100, Math.max(0, Math.round(Number(result.codingStyle) || (isCoding ? clampedScore : 80)))),
        cleanCode: Math.min(100, Math.max(0, Math.round(Number(result.cleanCode) || (isCoding ? clampedScore : 80)))),
        bestPractices: Math.min(100, Math.max(0, Math.round(Number(result.bestPractices) || clampedScore))),
        logicalThinking: Math.min(100, Math.max(0, Math.round(Number(result.logicalThinking) || clampedScore))),
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        missingConcepts: Array.isArray(result.missingConcepts) ? result.missingConcepts : [],
        mistakes: Array.isArray(result.mistakes) ? result.mistakes : [],
        idealAnswer: result.idealAnswer || modelAnswer || 'A structured enterprise response clearly addressing the core question requirements.',
        feedback: result.feedback || 'Answer evaluated.',
      };
    }
  } catch (err) {
    console.error('Groq Answer Evaluation Error:', err);
  }

  // Never fabricate fallback scores. If AI evaluation failed, return clear error for retry
  return {
    error: 'AI answer evaluation failed. Please check your connection and retry.',
  };
}

/**
 * Generate final comprehensive Interview Report with Groq AI.
 * Calculates true mathematical scores from actual question evaluations.
 * Unanswered questions are scored 0 and marked NOT_ANSWERED.
 */
export async function generateFinalInterviewReportAI({
  session,
  questions = [],
  answers = [],
  feedbacks = [],
}) {
  const totalQuestions = questions.length;

  const qData = questions.map((q, i) => {
    const ans = answers.find((a) => a.questionId === q.id) || answers[i] || {};
    const fb = feedbacks.find((f) => f.questionId === q.id) || feedbacks[i] || {};

    const rawAnswer = (ans.userAnswer || ans.textAnswer || ans.codeSnippet || fb.answer || fb.userAnswer || fb.candidateAnswer || '').trim();
    const isAnswered = Boolean(
      rawAnswer ||
      (fb.status && fb.status !== 'NOT_ANSWERED') ||
      (fb.verdict && fb.verdict !== 'NOT_ANSWERED') ||
      (typeof fb.score === 'number' && fb.score > 0)
    );

    // If candidate provided no answer, score must be 0 and verdict NOT_ANSWERED
    const score = isAnswered && typeof fb.score === 'number' && !isNaN(fb.score)
      ? Math.min(100, Math.max(0, Math.round(fb.score)))
      : 0;

    let verdict = 'NOT_ANSWERED';
    if (isAnswered) {
      const explicitVerdict = fb.status || fb.verdict;
      if (explicitVerdict && explicitVerdict !== 'NOT_ANSWERED') {
        verdict = explicitVerdict;
      } else {
        verdict = score >= 80 ? 'CORRECT' : score >= 50 ? 'PARTIALLY_CORRECT' : score === 0 ? 'NOT_ANSWERED' : 'INCORRECT';
      }
    }

    return {
      order: i + 1,
      questionId: q.id,
      question: q.question,
      category: q.category || 'TECHNICAL',
      questionType: q.questionType || 'TEXT',
      answer: isAnswered ? rawAnswer : '(No answer provided)',
      score,
      verdict,
      status: verdict,
      feedback: isAnswered ? (fb.summary || fb.feedback || 'Answer evaluated.') : 'No answer was provided for this question.',
      correctness: isAnswered ? (fb.correctness ?? score) : 0,
      technicalKnowledge: isAnswered ? (fb.technicalKnowledge ?? score) : 0,
      problemSolving: isAnswered ? (fb.problemSolving ?? score) : 0,
      communication: isAnswered ? (fb.communication ?? (score > 0 ? score : 0)) : 0,
      confidence: isAnswered ? (fb.confidence ?? (score > 0 ? 80 : 0)) : 0,
      strengths: isAnswered ? (fb.strengths || []) : [],
      missingConcepts: isAnswered ? (fb.missingConcepts || []) : (q.keyPoints || q.expectedConcepts || []),
      mistakes: isAnswered ? (fb.mistakes || []) : ['No answer was provided for this question.'],
      idealAnswer: fb.idealAnswer || q.bestAnswer || q.sampleAnswer || '',
    };
  });

  const answeredQuestions = qData.filter((d) => d.verdict !== 'NOT_ANSWERED');
  const hasAnswers = answeredQuestions.length > 0;

  // Ground-truth arithmetic averages based purely on question results
  const overallScore = totalQuestions > 0
    ? Math.round(qData.reduce((acc, curr) => acc + curr.score, 0) / totalQuestions)
    : 0;

  const techQuestions = qData.filter((d) => !['HR', 'BEHAVIORAL'].includes(d.category) && d.questionType !== 'CODE');
  const technicalScore = techQuestions.length > 0
    ? Math.round(techQuestions.reduce((acc, curr) => acc + curr.score, 0) / techQuestions.length)
    : 0;

  const codingQuestions = qData.filter((d) => d.questionType === 'CODE' || d.category === 'DSA');
  const codingScore = codingQuestions.length > 0
    ? Math.round(codingQuestions.reduce((acc, curr) => acc + curr.score, 0) / codingQuestions.length)
    : 0;

  const behavioralQuestions = qData.filter((d) => ['HR', 'BEHAVIORAL'].includes(d.category));
  const behaviorScore = behavioralQuestions.length > 0
    ? Math.round(behavioralQuestions.reduce((acc, curr) => acc + curr.score, 0) / behavioralQuestions.length)
    : 0;

  const problemSolvingScore = totalQuestions > 0
    ? Math.round(qData.reduce((acc, curr) => acc + curr.problemSolving, 0) / totalQuestions)
    : 0;

  const communicationScore = totalQuestions > 0
    ? Math.round(qData.reduce((acc, curr) => acc + curr.communication, 0) / totalQuestions)
    : 0;

  const confidenceScore = totalQuestions > 0
    ? Math.round(qData.reduce((acc, curr) => acc + curr.confidence, 0) / totalQuestions)
    : 0;

  // If candidate answered NOTHING, return 0% clean report immediately without calling AI
  if (!hasAnswers) {
    return {
      overallScore: 0,
      technicalScore: 0,
      codingScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
      problemSolvingScore: 0,
      behaviorScore: 0,
      interviewReadiness: 'Incomplete - No Answers Submitted',
      summary: `The candidate concluded the interview without submitting answers to any questions. As a result, candidate competencies could not be evaluated (0% overall score). All questions have been marked as Not Answered with a score of 0/100. To receive an accurate assessment and actionable feedback, please retake the interview and submit your answers.`,
      recommendation: 'NOT RECOMMENDED',
      strengths: [],
      weaknesses: ['No answers were submitted during this interview session.'],
      mistakes: ['All interview questions were left unanswered.'],
      missingConcepts: questions.flatMap((q) => q.keyPoints || q.expectedConcepts || []).slice(0, 10),
      recommendedTopics: [session.technology || 'General Programming', 'Structured Communication (STAR)', 'Interview Preparation Basics'],
      recommendedResources: [
        { title: `${session.technology || 'Engineering'} Official Documentation`, type: 'Documentation', url: 'https://developer.mozilla.org/' },
        { title: 'System Design Primer', type: 'Guide', url: 'https://github.com/donnemartin/system-design-primer' },
      ],
      learningPlan: [
        `Phase 1: Review core concepts and fundamentals of ${session.technology || 'the target role'}`,
        'Phase 2: Practice answering technical and situational questions out loud',
        'Phase 3: Retake this AI Mock Interview and submit responses to all questions',
      ],
      questionBreakdown: qData,
    };
  }

  // Synthesize qualitative narrative with Groq AI using real question data
  const prompt = `
You are the Executive Talent Assessor and Chief Interview Bar-Raiser.
Synthesize a comprehensive, honest final AI Mock Interview Report for candidate:
- Candidate Role: ${session.role}
- Tech Stack: ${session.technology}
- Experience Level: ${session.experience}
- Difficulty: ${session.difficulty}
- Interview Type: ${session.type || 'Technical'}
- Questions Evaluated: ${questions.length}
- Questions Answered: ${answeredQuestions.length}
- Ground Truth Overall Score: ${overallScore}%

DETAILED QUESTION-BY-QUESTION RESULTS:
${qData.map((d) => `Q${d.order}: ${d.question}\nCategory: ${d.category}\nCandidate Answer: ${d.answer}\nScore: ${d.score}/100\nVerdict: ${d.verdict}\nFeedback: ${d.feedback}`).join('\n\n')}

REPORT SYNTHESIS REQUIREMENTS:
1. Provide an honest Hiring Recommendation strictly reflecting the overall score (${overallScore}%):
   - >= 85%: "STRONG HIRE"
   - >= 70%: "HIRE"
   - >= 55%: "LEANING HIRE"
   - >= 35%: "NEEDS PREPARATION"
   - < 35%: "NOT RECOMMENDED"
2. Synthesize candidate's genuine strengths demonstrated in their actual answers.
3. Identify genuine technical knowledge gaps and weaknesses.
4. Provide Interview Readiness assessment.
5. Provide a personalized 3-phase improvement roadmap.
6. Recommend authoritative learning resources.

SCHEMA REQUIREMENTS:
Return valid raw JSON ONLY matching:
{
  "interviewReadiness": "...",
  "summary": "2-3 paragraphs executive summary of performance and capabilities...",
  "recommendation": "STRONG HIRE | HIRE | LEANING HIRE | NEEDS PREPARATION | NOT RECOMMENDED",
  "strengths": ["Top strength with evidence from answers"],
  "weaknesses": ["Key weakness observed"],
  "mistakes": ["Specific misconception identified"],
  "missingConcepts": ["Missing topic"],
  "recommendedTopics": ["Topic 1", "Topic 2"],
  "recommendedResources": [
    { "title": "Resource Name", "type": "Documentation | Book | Tutorial", "url": "https://..." }
  ],
  "learningPlan": [
    "Phase 1: ...",
    "Phase 2: ...",
    "Phase 3: ..."
  ]
}
`;

  try {
    const result = await callGroqJson(prompt);

    if (result) {
      return {
        overallScore,
        technicalScore,
        codingScore,
        communicationScore,
        confidenceScore,
        problemSolvingScore,
        behaviorScore,
        interviewReadiness: result.interviewReadiness || (overallScore >= 75 ? 'Interview Ready' : 'Developing - Needs Preparation'),
        summary: result.summary || `Candidate achieved an overall score of ${overallScore}% across ${questions.length} questions for ${session.role} (${session.technology}).`,
        recommendation: result.recommendation || (overallScore >= 80 ? 'STRONG HIRE' : overallScore >= 65 ? 'HIRE' : overallScore >= 50 ? 'LEANING HIRE' : 'NEEDS PREPARATION'),
        strengths: Array.isArray(result.strengths) && result.strengths.length > 0 ? result.strengths : answeredQuestions.flatMap((q) => q.strengths).slice(0, 5),
        weaknesses: Array.isArray(result.weaknesses) && result.weaknesses.length > 0 ? result.weaknesses : ['Needs targeted practice on unanswered or low-scoring concepts.'],
        mistakes: Array.isArray(result.mistakes) ? result.mistakes : [],
        missingConcepts: Array.isArray(result.missingConcepts) && result.missingConcepts.length > 0 ? result.missingConcepts : qData.flatMap((q) => q.missingConcepts).slice(0, 6),
        recommendedTopics: Array.isArray(result.recommendedTopics) && result.recommendedTopics.length > 0 ? result.recommendedTopics : [session.technology, 'Distributed Architecture', 'STAR Method'],
        recommendedResources: Array.isArray(result.recommendedResources) && result.recommendedResources.length > 0 ? result.recommendedResources : [
          { title: `${session.technology} Documentation`, type: 'Documentation', url: 'https://developer.mozilla.org/' },
          { title: 'System Design Primer', type: 'Guide', url: 'https://github.com/donnemartin/system-design-primer' },
        ],
        learningPlan: Array.isArray(result.learningPlan) && result.learningPlan.length > 0 ? result.learningPlan : [
          `Phase 1: Deep dive into ${session.technology} internals and core patterns`,
          'Phase 2: Practice timed coding and behavioral questions',
          'Phase 3: Run full-length mock interviews',
        ],
        questionBreakdown: qData,
      };
    }
  } catch (err) {
    console.error('Groq Final Report Synthesis Error:', err);
  }

  // Deterministic calculation if Groq synthesis is unavailable
  return {
    overallScore,
    technicalScore,
    codingScore,
    communicationScore,
    confidenceScore,
    problemSolvingScore,
    behaviorScore,
    interviewReadiness: overallScore >= 75 ? 'Interview Ready' : 'Developing - Needs Preparation',
    summary: `Candidate completed ${answeredQuestions.length} of ${questions.length} questions for the ${session.role} role with ${session.technology}. Evaluated overall score: ${overallScore}%.`,
    recommendation: overallScore >= 80 ? 'STRONG HIRE' : overallScore >= 65 ? 'HIRE' : overallScore >= 50 ? 'LEANING HIRE' : overallScore >= 35 ? 'NEEDS PREPARATION' : 'NOT RECOMMENDED',
    strengths: answeredQuestions.flatMap((q) => q.strengths).slice(0, 5),
    weaknesses: ['Review areas where questions were left unanswered or received partial marks.'],
    mistakes: answeredQuestions.flatMap((q) => q.mistakes).slice(0, 5),
    missingConcepts: qData.flatMap((q) => q.missingConcepts).slice(0, 6),
    recommendedTopics: [session.technology, 'System Architecture', 'STAR Framework'],
    recommendedResources: [
      { title: `${session.technology} Documentation`, type: 'Documentation', url: 'https://developer.mozilla.org/' },
      { title: 'System Design Primer', type: 'Guide', url: 'https://github.com/donnemartin/system-design-primer' },
    ],
    learningPlan: [
      `Phase 1: Deep dive into ${session.technology} fundamentals`,
      'Phase 2: Practice timed behavioral responses with the STAR method',
      'Phase 3: Retake full-length mock interviews',
    ],
    questionBreakdown: qData,
  };
}

/**
 * Generate 3 Similar Questions with AI
 */
export async function generateSimilarQuestionsAI({ questionText, category, difficulty, role }) {
  const prompt = `
Generate 3 similar, high-yield interview questions for:
Base Question: "${questionText}"
Category: ${category}
Difficulty: ${difficulty}
Role: ${role}

Return JSON format:
{
  "questions": [
    {
      "question": "Similar question text...",
      "sampleAnswer": "Sample answer...",
      "explanation": "Detailed explanation...",
      "bestAnswer": "Model answer...",
      "alternativeAnswer": "Alternative approach...",
      "commonMistakes": ["Mistake 1"],
      "followUp": "Follow-up question...",
      "interviewTips": ["Tip 1"]
    }
  ]
}
`;
  const result = await callGroqJson(prompt);
  if (result && Array.isArray(result.questions)) return result.questions;
  return [
    {
      question: `In ${category}, how do you ensure high availability and graceful error degradation under heavy load?`,
      sampleAnswer: 'By implementing circuit breaker patterns, timeout budgets, and fallback degradation paths.',
      explanation: 'Circuit breakers prevent cascading resource exhaustion when external systems stall.',
      bestAnswer: 'Combine connection pools, strict latency bounds, and asynchronous queue decoupling.',
      alternativeAnswer: 'Event-driven queue decoupling via Kafka or SQS.',
      commonMistakes: ['Retrying synchronously without jitter'],
      followUp: 'How do you measure and alert on circuit breaker trip events?',
      interviewTips: ['Discuss quantitative SLAs and MTTR targets'],
    },
  ];
}

/**
 * AI Explain Answer
 */
export async function explainAnswerAI({ questionText, answerText }) {
  const prompt = `
Explain the following interview question and answer in deep technical detail:
Question: "${questionText}"
Answer: "${answerText}"

Return JSON:
{
  "explanation": "Deep step-by-step breakdown explaining the underlying concepts, architecture, and reasoning..."
}
`;
  const result = await callGroqJson(prompt);
  return result?.explanation || `Detailed Technical Breakdown:\n${answerText}\n\nKey Concepts: Demonstrates foundational mastery of software architecture and systems design.`;
}

/**
 * AI Simplify Answer (ELI5)
 */
export async function simplifyAnswerAI({ questionText, answerText }) {
  const prompt = `
Simplify the following technical interview answer into a crystal-clear, ELI5 (Explain Like I'm 5) explanation:
Question: "${questionText}"
Answer: "${answerText}"

Return JSON:
{
  "simplified": "Simplified easy-to-understand explanation using clear analogies..."
}
`;
  const result = await callGroqJson(prompt);
  return result?.simplified || `Simplified Explanation:\nThink of this like an organized library checkout system. Rather than scanning every single shelf, an index allows you to jump straight to the exact location instantly.`;
}

/**
 * Modify Question Difficulty (Make Harder / Make Easier)
 */
export async function modifyQuestionDifficultyAI({ questionText, currentDifficulty, targetDifficulty, role }) {
  const prompt = `
Regenerate and adapt the following interview question from ${currentDifficulty} to ${targetDifficulty} difficulty level for a ${role}:
Original Question: "${questionText}"

Return JSON:
{
  "question": "Modified question text...",
  "difficulty": "${targetDifficulty}",
  "sampleAnswer": "Expected answer...",
  "explanation": "Detailed explanation...",
  "bestAnswer": "Best model answer...",
  "alternativeAnswer": "Alternative answer...",
  "commonMistakes": ["Mistake 1"],
  "followUp": "Follow-up question...",
  "interviewTips": ["Tip 1"]
}
`;
  const result = await callGroqJson(prompt);
  if (result && result.question) return result;
  return {
    question: targetDifficulty === 'Hard' || targetDifficulty === 'EXPERT'
      ? `Under extreme concurrent traffic (100k RPS), how would you re-architect "${questionText}" to guarantee zero data loss and sub-10ms response latency?`
      : `What is the core concept behind "${questionText}" in straightforward terms?`,
    difficulty: targetDifficulty,
    sampleAnswer: `Tailored ${targetDifficulty} response addressing execution and architectural trade-offs.`,
    explanation: `Explanation focused on ${targetDifficulty} candidate evaluation.`,
    bestAnswer: `Standard enterprise solution addressing scalability and reliability.`,
    alternativeAnswer: `Asynchronous decoupled execution model.`,
    commonMistakes: ['Underestimating payload scaling boundaries'],
    followUp: 'How do you measure latency at the p99 percentile?',
    interviewTips: ['Highlight production telemetry and observability'],
  };
}
