/**
 * CareerHub AI Assistant Strict Scope Enforcer
 * Enforces strict boundary: answers only CareerHub, DSA, coding, interviews, resumes, career, and tech concepts.
 * Refuses all unrelated general-purpose requests (weather, politics, sports, entertainment, random creative stories).
 */

const OUT_OF_SCOPE_PATTERNS = [
  // Weather
  /\b(today('?s)?\s+)?weather\b/i,
  /\bforecast\b/i,
  /\b(rain|snow|humidity|temperature\s+(today|outside|in\s+\w+))\b/i,
  // Politics & World Leaders
  /\b(president|prime\s+minister|chancellor|monarch|governor|king|queen|election|parliament|congress|senate|politics|politician)\b/i,
  // Entertainment, Gossip & Pop Culture
  /\b(celebrity|gossip|hollywood|bollywood|actor|actress|pop\s+star|horoscope|zodiac|movie|song|music|album)\b/i,
  // Sports & Scores
  /\b(football|cricket|soccer|nba|baseball|tennis|badminton|olympics|fifa|ipl)\b/i,
  /\b(match\s+score|live\s+score|tournament)\b/i,
  // News & Current Events
  /\b(breaking\s+news|world\s+news|headline)\b/i,
  // Random creative writing unrelated to career
  /\b(write\s+(me\s+)?(a\s+)?(random\s+)?(story|poem|fairy\s+tale|love\s+letter|joke))\b/i,
  /\btell\s+me\s+a\s+(funny\s+)?joke\b/i,
  // Food & Recipes
  /\b(recipe\s+for|how\s+to\s+cook|bake\s+a\s+cake|pizza\s+dough)\b/i,
];

// Technical concepts that are always ALLOWED even if general (DSA, SWE, Dev, Web, Systems, Languages)
const IN_SCOPE_TECH_KEYWORDS = [
  'dsa', 'algorithm', 'data structure', 'complexity', 'time complexity', 'space complexity',
  'big-o', 'binary search', 'two sum', 'dynamic programming', 'graph', 'tree', 'linked list',
  'recursion', 'hash map', 'array', 'stack', 'queue', 'heap', 'trie', 'sorting', 'greedy',
  'sliding window', 'two pointer', 'bfs', 'dfs', 'backtracking', 'monaco', 'leetcode',
  'python', 'java', 'c++', 'javascript', 'typescript', 'react', 'next.js', 'nextjs', 'node',
  'express', 'sql', 'postgresql', 'prisma', 'mongodb', 'docker', 'git', 'github', 'rest api',
  'system design', 'microservices', 'oop', 'concurrency', 'multithreading', 'database',
  'interview', 'mock interview', 'behavioral', 'star method', 'resume', 'ats', 'ats score',
  'career', 'careerhub', 'job', 'application', 'assessment', 'coding', 'solution', 'bug',
  'failing', 'runtime error', 'wrong answer', 'tle', 'testcase', 'submission',
];

/**
 * Checks if user message is outside CareerHub scope.
 * Returns { isOutOfScope: boolean, refusalMessage: string | null }
 */
export function checkCareerHubScope(userPrompt) {
  if (!userPrompt || typeof userPrompt !== 'string') {
    return { isOutOfScope: false, refusalMessage: null };
  }

  const prompt = userPrompt.trim().toLowerCase();

  // If prompt explicitly mentions tech or CareerHub concepts, treat as in-scope
  const hasTechKeyword = IN_SCOPE_TECH_KEYWORDS.some((kw) => prompt.includes(kw));
  if (hasTechKeyword) {
    return { isOutOfScope: false, refusalMessage: null };
  }

  // Check out-of-scope patterns
  for (const pattern of OUT_OF_SCOPE_PATTERNS) {
    if (pattern.test(prompt)) {
      if (/weather/i.test(prompt)) {
        return {
          isOutOfScope: true,
          refusalMessage:
            'I can help only with CareerHub-related questions such as coding, DSA, interviews, resumes, career preparation, learning progress, and CareerHub features.',
        };
      }
      if (/president|prime\s+minister|polit/i.test(prompt)) {
        return {
          isOutOfScope: true,
          refusalMessage:
            'I’m the CareerHub AI Assistant, so I can only help with CareerHub-related topics.',
        };
      }
      if (/story|poem|joke/i.test(prompt)) {
        return {
          isOutOfScope: true,
          refusalMessage:
            'I can help with CareerHub-related tasks, but I’m not designed for unrelated requests.',
        };
      }
      return {
        isOutOfScope: true,
        refusalMessage:
          'I am the dedicated CareerHub AI Assistant. I can only assist with technical interviews, coding challenges, DSA, resumes, ATS scoring, career roadmaps, and CareerHub features.',
      };
    }
  }

  return { isOutOfScope: false, refusalMessage: null };
}
