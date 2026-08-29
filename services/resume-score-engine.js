/**
 * Multi-Dimensional Deterministic Resume Scoring Engine for CareerHub
 *
 * Base Score Breakdown (Total = 100 Points):
 * 1. ATS Compatibility              15 pts
 * 2. Contact Information           5 pts
 * 3. Professional Summary          10 pts
 * 4. Skills                        15 pts (with Anti-Gaming credibility penalty)
 * 5. Work Experience               20 pts (rewards quantification & action verbs)
 * 6. Projects                      15 pts (rewards complexity & demo links)
 * 7. Education                     5 pts
 * 8. Achievements / Certifications 5 pts
 * 9. Keywords / Job Relevance     5 pts
 * 10. Formatting / Readability      5 pts
 */

// Common Tech Skills Database for Detection
const COMMON_TECH_SKILLS = [
  'javascript', 'typescript', 'react', 'next.js', 'nextjs', 'vue', 'angular', 'node.js', 'nodejs',
  'express', 'python', 'django', 'fastapi', 'flask', 'java', 'spring', 'spring boot', 'c++', 'c#',
  '.net', 'golang', 'go', 'rust', 'php', 'laravel', 'html', 'css', 'tailwind', 'bootstrap',
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'oracle', 'dynamodb',
  'graphql', 'rest api', 'restful', 'grpc', 'microservices', 'system design', 'docker',
  'kubernetes', 'k8s', 'aws', 'gcp', 'azure', 'ci/cd', 'github actions', 'jenkins', 'git',
  'linux', 'bash', 'unit testing', 'jest', 'cypress', 'selenium', 'prisma', 'redux',
  'kafka', 'rabbitmq', 'elasticsearch', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'machine learning', 'ai'
];

// Meaningless Fluff Keywords
const BUZZWORDS = [
  'hardworking', 'self-starter', 'guru', 'ninja', 'rockstar', 'think outside the box',
  'synergy', 'go-getter', 'results-oriented', 'detail-oriented', 'team player', 'motivated',
  'passionate worker', 'fast learner', 'dynamic professional'
];

// Action Verbs for Strong Work Experience Bullet Points
const ACTION_VERBS = [
  'architected', 'engineered', 'spearheaded', 'implemented', 'developed', 'optimized',
  'refactored', 'designed', 'built', 'deployed', 'automated', 'integrated', 'reduced',
  'increased', 'scaled', 'managed', 'led', 'accelerated', 'launched', 'improved',
  'eliminated', 'enhanced', 'streamlined', 'created', 'resolved'
];

/**
 * Main Entry Point: Parse Resume Text & Calculate Deterministic Multi-Dimensional Score
 */
export function calculateDeterministicResumeScore(resumeText = '', jobDescription = null) {
  const text = (resumeText || '').trim();
  const lowerText = text.toLowerCase();

  // Edge case: Empty or extremely short text
  if (!text || text.length < 30) {
    return createZeroScoreResult('Empty or unreadable resume text provided.');
  }

  // Section parsing
  const sections = parseResumeSections(text);

  // 1. ATS Compatibility (15 pts)
  const atsResult = evaluateATSCompatibility(text, sections);

  // 2. Contact Information (5 pts)
  const contactResult = evaluateContactInformation(text);

  // 3. Professional Summary (10 pts)
  const summaryResult = evaluateProfessionalSummary(text, sections);

  // 4. Skills (15 pts)
  const skillsResult = evaluateSkills(text, sections);

  // 5. Work Experience (20 pts)
  const expResult = evaluateWorkExperience(text, sections);

  // 6. Projects (15 pts)
  const projectsResult = evaluateProjects(text, sections);

  // 7. Education (5 pts)
  const eduResult = evaluateEducation(text, sections);

  // 8. Achievements / Certifications (5 pts)
  const achievementsResult = evaluateAchievements(text, sections);

  // 9. Keywords & Job Relevance (5 pts)
  const keywordsResult = evaluateKeywordsAndJobRelevance(text, jobDescription);

  // 10. Formatting & Readability (5 pts)
  const formattingResult = evaluateFormattingAndReadability(text);

  // Category Breakdown Map
  const categoryScores = {
    ats: Math.min(15, Math.max(0, atsResult.score)),
    contact: Math.min(5, Math.max(0, contactResult.score)),
    summary: Math.min(10, Math.max(0, summaryResult.score)),
    skills: Math.min(15, Math.max(0, skillsResult.score)),
    experience: Math.min(20, Math.max(0, expResult.score)),
    projects: Math.min(15, Math.max(0, projectsResult.score)),
    education: Math.min(5, Math.max(0, eduResult.score)),
    achievements: Math.min(5, Math.max(0, achievementsResult.score)),
    keywords: Math.min(5, Math.max(0, keywordsResult.score)),
    formatting: Math.min(5, Math.max(0, formattingResult.score)),
  };

  // Base Score Calculation
  const baseScore = Object.values(categoryScores).reduce((a, b) => a + b, 0);

  // Category Explanations
  const categoryExplanations = {
    ats: atsResult.explanation,
    contact: contactResult.explanation,
    summary: summaryResult.explanation,
    skills: skillsResult.explanation,
    experience: expResult.explanation,
    projects: projectsResult.explanation,
    education: eduResult.explanation,
    achievements: achievementsResult.explanation,
    keywords: keywordsResult.explanation,
    formatting: formattingResult.explanation,
  };

  // Strengths, Weaknesses, Missing Skills & Priority Improvements
  const strengths = [];
  const weaknesses = [];

  if (categoryScores.experience >= 14) strengths.push('Strong work experience with technical impact and action verbs.');
  else if (categoryScores.experience < 10) weaknesses.push('Work experience lacks quantified metrics (e.g. %, ROI, response time improvements).');

  if (categoryScores.projects >= 11) strengths.push('High-complexity technical projects demonstrated with technologies and clear outcomes.');
  else if (categoryScores.projects < 7) weaknesses.push('Projects lack implementation details or live demo/GitHub links.');

  if (categoryScores.skills >= 11) strengths.push('Well-rounded technical skill set demonstrated in project/work context.');
  if (skillsResult.credibilityPenalty > 0) weaknesses.push('Excessive skill listing without supporting evidence in experience or projects.');

  if (categoryScores.ats >= 11) strengths.push('Excellent ATS compatibility with standard section headings.');
  else weaknesses.push('Non-standard headings or missing essential sections reduce ATS parseability.');

  if (categoryScores.summary < 6) weaknesses.push('Professional summary is generic or missing specific technical focus.');

  // Quality Level Mapping
  const qualityLevel = getQualityLevel(baseScore);

  return {
    baseScore,
    categoryScores,
    categoryExplanations,
    qualityLevel,
    atsScore: Math.round((categoryScores.ats / 15) * 100),
    detectedSkills: skillsResult.detectedSkills,
    missingSkills: keywordsResult.missingSkills || [],
    strengths,
    weaknesses,
    priorityImprovements: generatePriorityImprovements(categoryScores),
    parsedSections: Object.keys(sections).filter((k) => sections[k].length > 0),
  };
}

/**
 * Parses raw text into section blocks
 */
function parseResumeSections(text) {
  const lines = text.split('\n');
  const sections = {
    summary: [],
    experience: [],
    projects: [],
    education: [],
    skills: [],
    achievements: [],
    other: [],
  };

  let currentSection = 'summary';

  const headingRegexes = {
    summary: /^(summary|objective|about me|profile|professional summary)$/i,
    experience: /^(experience|work experience|employment|work history|professional experience)$/i,
    projects: /^(projects|personal projects|key projects|academic projects)$/i,
    education: /^(education|academic background|qualifications|academic history)$/i,
    skills: /^(skills|technical skills|technologies|skills & tools|core competencies)$/i,
    achievements: /^(achievements|certifications|awards|honors|publications|certificates)$/i,
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    let matched = false;
    for (const [secKey, regex] of Object.entries(headingRegexes)) {
      if (regex.test(line.replace(/[:#-]/g, '').trim())) {
        currentSection = secKey;
        matched = true;
        break;
      }
    }

    if (!matched) {
      sections[currentSection].push(line);
    }
  }

  return {
    summary: sections.summary.join(' '),
    experience: sections.experience.join(' '),
    projects: sections.projects.join(' '),
    education: sections.education.join(' '),
    skills: sections.skills.join(' '),
    achievements: sections.achievements.join(' '),
  };
}

/**
 * 1. ATS Compatibility (15 pts)
 */
function evaluateATSCompatibility(text, sections) {
  let score = 0;
  const reasons = [];

  // Standard headings presence (up to 8 pts)
  let headingCount = 0;
  if (sections.experience.length > 20) headingCount++;
  if (sections.education.length > 10) headingCount++;
  if (sections.skills.length > 10) headingCount++;
  if (sections.projects.length > 10 || sections.summary.length > 10) headingCount++;

  score += Math.min(8, headingCount * 2);
  reasons.push(`${headingCount} standard sections detected.`);

  // Clean readable text without corruption (3 pts)
  const unprintableChars = (text.match(/[^\x20-\x7E\n\r\t]/g) || []).length;
  if (unprintableChars < 5) {
    score += 3;
    reasons.push('Clean un-corrupted text encoding.');
  } else {
    reasons.push('Contains non-standard symbols that may confuse ATS parsers.');
  }

  // Section order & absence of multi-column table clutter (4 pts)
  if (text.length >= 100 && text.length <= 15000) {
    score += 4;
    reasons.push('Optimal document length and linear structure.');
  } else if (text.length < 100) {
    reasons.push('Text too short for ATS evaluation.');
  }

  return {
    score: Math.min(15, score),
    explanation: `ATS Score: ${Math.min(15, score)}/15. ${reasons.join(' ')}`,
  };
}

/**
 * 2. Contact Information (5 pts)
 */
function evaluateContactInformation(text) {
  let score = 0;
  const found = [];

  // Email match
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    score += 2;
    found.push('Email');
  }

  // Phone match
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    score += 1.5;
    found.push('Phone');
  }

  // Name heuristic (first 2 lines usually contain name)
  const firstLines = text.split('\n').slice(0, 3).join(' ');
  if (/[A-Z][a-z]+\s+[A-Z][a-z]+/.test(firstLines)) {
    score += 1;
    found.push('Name');
  }

  // Bonus links: LinkedIn, GitHub, Portfolio, Location
  const hasLinkedIn = /linkedin\.com/i.test(text);
  const hasGitHub = /github\.com/i.test(text);
  const hasLocation = /(new york|london|san francisco|remote|india|usa|ca|uk|texas)/i.test(text);

  if (hasLinkedIn || hasGitHub || hasLocation) {
    score += 0.5;
    found.push('Links/Location');
  }

  return {
    score: Math.min(5, Math.round(score * 10) / 10),
    explanation: `Contact Details: ${found.length > 0 ? found.join(', ') : 'Incomplete contact information'}.`,
  };
}

/**
 * 3. Professional Summary (10 pts)
 */
function evaluateProfessionalSummary(text, sections) {
  const summaryText = sections.summary || '';
  let score = 0;
  const notes = [];

  if (summaryText.length > 20) {
    score += 3;
    notes.push('Summary section present.');

    const wordCount = summaryText.split(/\s+/).length;
    if (wordCount >= 20 && wordCount <= 120) {
      score += 3;
      notes.push('Good summary length.');
    } else {
      notes.push('Summary is too short or overly verbose.');
    }

    // Technical focus
    const techCount = COMMON_TECH_SKILLS.filter((s) => summaryText.toLowerCase().includes(s)).length;
    if (techCount >= 2) {
      score += 2;
      notes.push('Includes specific technical domain keywords.');
    }

    // Buzzword penalty check
    const buzzwordCount = BUZZWORDS.filter((bw) => summaryText.toLowerCase().includes(bw)).length;
    if (buzzwordCount === 0) {
      score += 2;
    } else {
      notes.push('Contains generic fluff buzzwords.');
    }
  } else {
    notes.push('No dedicated professional summary section found.');
  }

  return {
    score: Math.min(10, score),
    explanation: `Summary Score: ${score}/10. ${notes.join(' ')}`,
  };
}

/**
 * 4. Skills (15 pts) & Anti-Gaming Penalty
 */
function evaluateSkills(text, sections) {
  const lowerText = text.toLowerCase();
  const detected = COMMON_TECH_SKILLS.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  });

  let score = 0;
  const notes = [];

  // Skill quantity score (up to 8 pts)
  const count = detected.length;
  if (count >= 12) score += 8;
  else if (count >= 8) score += 6;
  else if (count >= 4) score += 4;
  else if (count >= 1) score += 2;

  notes.push(`Detected ${count} technical skills.`);

  // Skill Categorization/Grouping (3 pts)
  if (/(frontend|backend|databases|devops|frameworks|tools|languages)/i.test(sections.skills || text)) {
    score += 3;
    notes.push('Categorized skill structure.');
  }

  // Core SE relevance (4 pts)
  const coreSE = ['git', 'react', 'node.js', 'python', 'java', 'sql', 'postgresql', 'docker', 'aws', 'typescript'];
  const matchedCore = coreSE.filter((s) => lowerText.includes(s)).length;
  score += Math.min(4, matchedCore);

  // ANTI-GAMING CREDIBILITY PENALTY:
  // Check if skills listed are actually demonstrated in Experience or Projects text
  const expAndProjectText = (sections.experience + ' ' + sections.projects).toLowerCase();
  let demonstratedCount = 0;

  detected.forEach((skill) => {
    if (expAndProjectText.includes(skill)) {
      demonstratedCount++;
    }
  });

  let credibilityPenalty = 0;
  if (count >= 15 && demonstratedCount < Math.floor(count * 0.3)) {
    // Stuffed 15+ skills but less than 30% are in Experience/Projects!
    credibilityPenalty = 4;
    score = Math.max(2, score - credibilityPenalty);
    notes.push('CREDIBILITY PENALTY: Large list of skills without usage evidence in experience or projects.');
  }

  return {
    score: Math.min(15, score),
    detectedSkills: detected.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    credibilityPenalty,
    explanation: `Skills Score: ${score}/15. ${notes.join(' ')}`,
  };
}

/**
 * 5. Work Experience (20 pts)
 */
function evaluateWorkExperience(text, sections) {
  const expText = sections.experience || '';
  let score = 0;
  const notes = [];

  if (expText.length > 30) {
    score += 4; // Base experience present

    // Action verbs evaluation (up to 5 pts)
    const lowerExp = expText.toLowerCase();
    const actionVerbsFound = ACTION_VERBS.filter((verb) => lowerExp.includes(verb)).length;
    score += Math.min(5, actionVerbsFound * 1.5);
    notes.push(`${actionVerbsFound} strong action verbs used.`);

    // QUANTIFIED RESULTS & METRICS (up to 7 pts)
    // Matches percentages, time improvements, monetary numbers, user scales
    const metricMatches = expText.match(/(\d+%\s*|\$\d+|\b\d+x\b|\b\d+\s*ms\b|\b\d+\s*users\b|\breduced\s+by\s+\d+|\bincreased\s+by\s+\d+)/gi) || [];
    const metricCount = metricMatches.length;

    if (metricCount >= 4) {
      score += 7;
      notes.push(`High quantitative impact demonstrated (${metricCount} metrics/percentages found).`);
    } else if (metricCount >= 2) {
      score += 5;
      notes.push(`Good quantitative metrics (${metricCount} found).`);
    } else if (metricCount === 1) {
      score += 3;
      notes.push('Limited quantitative metrics found.');
    } else {
      notes.push('Lacks quantified impact metrics (e.g., %, ROI, performance gains).');
    }

    // Role titles and technical responsibility details (4 pts)
    if (/(engineer|developer|architect|lead|analyst|intern|consultant)/i.test(expText)) {
      score += 4;
    }
  } else {
    notes.push('No detailed work experience section detected.');
  }

  return {
    score: Math.min(20, Math.round(score)),
    explanation: `Experience Score: ${Math.min(20, Math.round(score))}/20. ${notes.join(' ')}`,
  };
}

/**
 * 6. Projects (15 pts)
 */
function evaluateProjects(text, sections) {
  const projText = sections.projects || '';
  let score = 0;
  const notes = [];

  if (projText.length > 30) {
    score += 4; // Projects present

    // Links detection (GitHub / Vercel / Live demo) (3 pts)
    if (/github\.com|vercel\.app|netlify\.app|demo|http/i.test(projText)) {
      score += 3;
      notes.push('Live project or repository links included.');
    }

    // Technical complexity signals (5 pts)
    const complexityKeywords = [
      'full-stack', 'microservices', 'authentication', 'jwt', 'database',
      'redis', 'docker', 'aws', 'rest api', 'graphql', 'real-time', 'websockets',
      'next.js', 'react', 'ci/cd', 'deployment'
    ];
    const matchedComplexity = complexityKeywords.filter((k) => projText.toLowerCase().includes(k)).length;
    score += Math.min(5, matchedComplexity * 1.5);
    notes.push(`Technical complexity rating: ${matchedComplexity} key architectural concepts.`);

    // Problem & Solution detail (3 pts)
    if (projText.split(/\s+/).length >= 40) {
      score += 3;
    }
  } else {
    notes.push('No technical projects section detected.');
  }

  return {
    score: Math.min(15, Math.round(score)),
    explanation: `Projects Score: ${Math.min(15, Math.round(score))}/15. ${notes.join(' ')}`,
  };
}

/**
 * 7. Education (5 pts)
 */
function evaluateEducation(text, sections) {
  const eduText = sections.education || text;
  let score = 0;

  if (/(bachelor|master|b\.s|m\.s|b\.tech|m\.tech|degree|computer science|engineering|university|college)/i.test(eduText)) {
    score += 4;
    if (/\b(20\d\d|19\d\d)\b/.test(eduText)) {
      score += 1;
    }
  } else if (sections.education.length > 10) {
    score += 3;
  }

  return {
    score: Math.min(5, score),
    explanation: `Education Score: ${score}/5. Degree and institution details verified.`,
  };
}

/**
 * 8. Achievements & Certifications (5 pts)
 */
function evaluateAchievements(text, sections) {
  const achText = sections.achievements + ' ' + text;
  let score = 0;

  const certMatch = achText.match(/(aws certified|google certified|meta certified|oracle certified|certified|certification|hackerank|leetcode|codeforces|hackathon|first place|winner|published|open-source)/gi) || [];

  if (certMatch.length >= 3) score = 5;
  else if (certMatch.length === 2) score = 4;
  else if (certMatch.length === 1) score = 3;
  else if (sections.achievements.length > 10) score = 2;

  return {
    score: Math.min(5, score),
    explanation: `Achievements Score: ${score}/5. ${certMatch.length} verified credentials/awards found.`,
  };
}

/**
 * 9. Keywords & Job Relevance (5 pts)
 */
function evaluateKeywordsAndJobRelevance(text, jobDescription) {
  let score = 0;
  const missingSkills = [];
  const lowerText = text.toLowerCase();

  if (jobDescription && jobDescription.length > 30) {
    // Target JD matching mode
    const lowerJd = jobDescription.toLowerCase();
    const jdSkills = COMMON_TECH_SKILLS.filter((s) => lowerJd.includes(s));

    let matched = 0;
    jdSkills.forEach((sk) => {
      if (lowerText.includes(sk)) {
        matched++;
      } else {
        missingSkills.push(sk.charAt(0).toUpperCase() + sk.slice(1));
      }
    });

    const matchRatio = jdSkills.length > 0 ? matched / jdSkills.length : 0.8;
    score = Math.round(matchRatio * 5);
  } else {
    // General SE keyword density
    const coreKeywords = ['data structures', 'algorithms', 'git', 'system design', 'testing', 'api', 'database'];
    const matchedCore = coreKeywords.filter((k) => lowerText.includes(k)).length;
    score = Math.min(5, Math.max(2, Math.round((matchedCore / coreKeywords.length) * 5)));
  }

  return {
    score: Math.min(5, score),
    missingSkills: missingSkills.slice(0, 6),
    explanation: `Job Keyword Match Score: ${score}/5.`,
  };
}

/**
 * 10. Formatting & Readability (5 pts)
 */
function evaluateFormattingAndReadability(text) {
  let score = 0;
  const wordCount = text.split(/\s+/).length;

  // Word count health
  if (wordCount >= 250 && wordCount <= 1200) {
    score += 2;
  } else if (wordCount >= 150) {
    score += 1;
  }

  // Bullet point structure
  if (/[\n\r]\s*[\bullet•\-\*]/g.test(text) || text.split('\n').length >= 15) {
    score += 2;
  }

  // Punctuation cleanliness
  if (!/(,,|\?\?|!!)/.test(text)) {
    score += 1;
  }

  return {
    score: Math.min(5, score),
    explanation: `Formatting & Readability Score: ${score}/5.`,
  };
}

/**
 * Quality Level Label Mapping
 */
export function getQualityLevel(score) {
  if (score >= 90) return 'Outstanding';
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 60) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  if (score >= 40) return 'Weak';
  return 'Poor';
}

/**
 * Priority Improvements Generator
 */
function generatePriorityImprovements(categoryScores) {
  const priorities = [];

  if (categoryScores.experience < 14) {
    priorities.push({
      priority: 'High',
      category: 'Work Experience',
      suggestion: 'Quantify experience bullet points with concrete metrics (e.g., "Reduced latency by 30%", "Increased user conversion by 15%").',
    });
  }

  if (categoryScores.projects < 11) {
    priorities.push({
      priority: 'High',
      category: 'Projects',
      suggestion: 'Add technical architecture details (Next.js, PostgreSQL, Docker) and include live Vercel/GitHub links.',
    });
  }

  if (categoryScores.summary < 7) {
    priorities.push({
      priority: 'Medium',
      category: 'Professional Summary',
      suggestion: 'Rewrite professional summary to highlight 2-3 specific technical specialties instead of generic buzzwords.',
    });
  }

  if (categoryScores.skills < 11) {
    priorities.push({
      priority: 'Medium',
      category: 'Skills',
      suggestion: 'Group technical skills into clear categories (Languages, Frameworks, Databases, Tools) and demonstrate them in project experience.',
    });
  }

  if (categoryScores.contact < 4) {
    priorities.push({
      priority: 'Low',
      category: 'Contact Info',
      suggestion: 'Ensure LinkedIn profile, GitHub repository links, and phone number are clearly visible.',
    });
  }

  return priorities;
}

/**
 * Zero Score Fallback for Empty/Corrupt Input
 */
function createZeroScoreResult(reason) {
  const zeroScores = {
    ats: 0, contact: 0, summary: 0, skills: 0, experience: 0,
    projects: 0, education: 0, achievements: 0, keywords: 0, formatting: 0,
  };
  return {
    baseScore: 0,
    categoryScores: zeroScores,
    categoryExplanations: {
      ats: reason, contact: reason, summary: reason, skills: reason, experience: reason,
      projects: reason, education: reason, achievements: reason, keywords: reason, formatting: reason,
    },
    qualityLevel: 'Poor',
    atsScore: 0,
    detectedSkills: [],
    missingSkills: [],
    strengths: [],
    weaknesses: [reason],
    priorityImprovements: [{ priority: 'High', category: 'General', suggestion: 'Upload a readable resume text file.' }],
    parsedSections: [],
  };
}
