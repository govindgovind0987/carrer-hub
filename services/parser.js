import pdfParse from 'pdf-parse';

/**
 * Extracts plain text from a PDF Buffer
 */
export async function extractTextFromPdf(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text || '';
  } catch (error) {
    console.warn('pdf-parse failed, fallback to string extraction:', error);
    return pdfBuffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, '');
  }
}

/**
 * Automated Regex & NLP Parser for Resume Text
 */
export function parseResumeText(text) {
  if (!text) return {};

  // Extract Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // Extract Phone Number
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  // Extract GitHub URL
  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const githubUrl = githubMatch ? githubMatch[0] : null;

  // Extract LinkedIn URL
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedinUrl = linkedinMatch ? linkedinMatch[0] : null;

  // Known Technical Skills List
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express',
    'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'C++', 'C#',
    'HTML', 'CSS', 'Tailwind CSS', 'PostgreSQL', 'MySQL', 'MongoDB',
    'Redis', 'GraphQL', 'REST API', 'Docker', 'Kubernetes', 'AWS', 'GCP',
    'Git', 'CI/CD', 'Jest', 'Cypress', 'Prisma', 'Redux', 'System Design'
  ];

  const extractedSkills = commonSkills.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  );

  return {
    email,
    phone,
    githubUrl,
    linkedinUrl,
    skills: extractedSkills,
    rawText: text,
  };
}
