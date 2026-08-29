const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach((line) => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const rawConnectionString = process.env.DATABASE_URL;
const connectionString = rawConnectionString
  ? rawConnectionString.replace(/sslmode=(require|prefer|verify-ca)/g, 'sslmode=verify-full')
  : rawConnectionString;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log('Starting seed script for development jobs...');

  // 1. Ensure at least one recruiter user exists
  let recruiter = await prisma.user.findFirst({
    where: { role: 'RECRUITER' },
  });

  if (!recruiter) {
    recruiter = await prisma.user.findFirst();
  }

  if (!recruiter) {
    recruiter = await prisma.user.create({
      data: {
        name: 'Demo Recruiter',
        email: 'recruiter@careerhub.com',
        role: 'RECRUITER',
      },
    });
    console.log('Created recruiter user:', recruiter.id);
  }

  // 2. Ensure a company exists
  let company = await prisma.company.findFirst({
    where: { recruiterId: recruiter.id },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        recruiterId: recruiter.id,
        name: 'TechCorp AI Solutions',
        slug: 'techcorp-ai-solutions',
        description: 'Next-generation AI workforce solutions and engineering platform.',
        location: 'San Francisco, CA',
        industry: 'Software & Artificial Intelligence',
      },
    });
    console.log('Created company:', company.id);
  }

  // 3. Create Sample Published Jobs
  const sampleJobs = [
    {
      title: 'Senior Full Stack Engineer',
      slug: `senior-full-stack-engineer-${Date.now()}-1`,
      category: 'Software Engineering',
      location: 'Remote',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR_LEVEL',
      salaryMin: 130000,
      salaryMax: 170000,
      salaryCurrency: 'USD',
      description: 'We are seeking an experienced Senior Full Stack Engineer to architect and build scalable Next.js and Node.js applications with real-time AI capabilities.',
      requirements: '5+ years experience with React, Next.js, TypeScript, PostgreSQL, and AWS/Cloud deployments.',
      status: 'PUBLISHED',
      featured: true,
    },
    {
      title: 'Frontend Engineer (React & Next.js)',
      slug: `frontend-engineer-${Date.now()}-2`,
      category: 'Frontend Development',
      location: 'San Francisco, CA (Hybrid)',
      jobType: 'FULL_TIME',
      experienceLevel: 'MID_LEVEL',
      salaryMin: 110000,
      salaryMax: 140000,
      salaryCurrency: 'USD',
      description: 'Join our dynamic frontend engineering team crafting responsive, performant user interfaces with dynamic Tailwind animations and state management.',
      requirements: '3+ years experience with React 19, Next.js App Router, CSS animations, and modern Web APIs.',
      status: 'PUBLISHED',
      featured: false,
    },
    {
      title: 'AI & Machine Learning Engineer',
      slug: `ai-ml-engineer-${Date.now()}-3`,
      category: 'Artificial Intelligence',
      location: 'New York, NY (Remote)',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR_LEVEL',
      salaryMin: 150000,
      salaryMax: 195000,
      salaryCurrency: 'USD',
      description: 'Build enterprise LLM pipelines, RAG systems, and agentic AI workflows integrating with OpenAI and Groq APIs.',
      requirements: 'Experience with Python, LangChain, Llama models, Vector Databases (Pinecone/Qdrant), and Next.js integrations.',
      status: 'PUBLISHED',
      featured: true,
    },
    {
      title: 'Backend Systems & Database Architect',
      slug: `backend-database-architect-${Date.now()}-4`,
      category: 'Backend Development',
      location: 'Remote',
      jobType: 'CONTRACT',
      experienceLevel: 'LEAD',
      salaryMin: 140000,
      salaryMax: 180000,
      salaryCurrency: 'USD',
      description: 'Design robust relational database schemas, microservices, and high-throughput server action pipelines using Prisma and PostgreSQL.',
      requirements: 'Deep knowledge of PostgreSQL optimization, index tuning, Node.js microservices, and REST/GraphQL APIs.',
      status: 'PUBLISHED',
      featured: false,
    },
    {
      title: 'DevOps & Infrastructure Lead',
      slug: `devops-infrastructure-lead-${Date.now()}-5`,
      category: 'DevOps & Cloud',
      location: 'Austin, TX (Remote)',
      jobType: 'FULL_TIME',
      experienceLevel: 'LEAD',
      salaryMin: 145000,
      salaryMax: 185000,
      salaryCurrency: 'USD',
      description: 'Own our CI/CD pipelines, Docker container orchestration, Vercel deployments, and database replica infrastructure.',
      requirements: 'AWS, Docker, Kubernetes, GitHub Actions, terraform, monitoring (Datadog/Sentry).',
      status: 'PUBLISHED',
      featured: false,
    },
  ];

  for (const jobData of sampleJobs) {
    const created = await prisma.job.create({
      data: {
        ...jobData,
        companyId: company.id,
        recruiterId: recruiter.id,
      },
    });
    console.log(`Created job: ${created.title} (${created.id})`);
  }

  console.log('Seeding completed successfully!');
}

seed()
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
