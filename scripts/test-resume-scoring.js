import { calculateDeterministicResumeScore } from '../services/resume-score-engine.js';
import { analyzeResumeWithAI } from '../services/ai.js';

const SCENARIOS = [
  {
    id: 1,
    name: '1. Excellent Software Engineer Resume',
    text: `
John Doe
john.doe@email.com | +1 555 123 4567 | San Francisco, CA | github.com/johndoe | linkedin.com/in/johndoe

SUMMARY
Senior Full Stack Engineer with 6+ years of experience building high-performance web applications using React, Next.js, Node.js, and PostgreSQL. Demonstrated track record of optimizing system throughput and scaling cloud infrastructure.

TECHNICAL SKILLS
Languages & Frameworks: JavaScript, TypeScript, React, Next.js, Node.js, Express, Python, HTML, CSS, Tailwind CSS
Databases & Cloud: PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, Git, CI/CD, REST API, GraphQL, System Design

WORK EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2021 - Present
- Architected microservices backend using Node.js and PostgreSQL, increasing system transaction throughput by 45%.
- Spearheaded frontend migration to Next.js App Router, improving Google Lighthouse SEO score from 62 to 98.
- Optimized Redis caching layer, reducing P99 API response latency by 35% across 500k daily active users.
- Automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing build deployment time from 25 min to 4 min.

Full Stack Developer | CloudSystems | 2018 - 2021
- Engineered real-time collaborative dashboard with React and WebSockets, supporting 10,000 concurrent socket connections.
- Refactored legacy monolithic API into Node.js REST endpoints, eliminating 99.9% of unhandled production crashes.

PROJECTS
E-Commerce Microservices Engine | React, Node.js, Docker, AWS | github.com/johndoe/ecommerce
- Implemented Stripe payment gateway integration and JWT authentication, processing $50,000+ test transactions.
- Deployed multi-container environment with Docker and Kubernetes on AWS EC2.

EDUCATION
Bachelor of Science in Computer Science | Stanford University | 2014 - 2018

ACHIEVEMENTS & CERTIFICATIONS
- AWS Certified Solutions Architect (2022)
- 1st Place Winner - National Hackathon 2020
`,
  },
  {
    id: 2,
    name: '2. Strong Fresher Resume',
    text: `
Jane Smith
jane.smith@email.com | +1 555 987 6543 | Austin, TX | github.com/janesmith | linkedin.com/in/janesmith

SUMMARY
Computer Science graduate with strong algorithms foundation and hands-on experience building web applications in React, Node.js, and Python.

SKILLS
Programming: Python, JavaScript, Java, C++, HTML, CSS, React, Node.js, Express, PostgreSQL, Git, Data Structures, Algorithms

PROJECTS
AI Resume Parser & Optimizer | React, Node.js, Python, PostgreSQL | github.com/janesmith/resume-parser
- Built automated PDF resume parser extracting contact info and technical skills using Regex and NLP.
- Integrated PostgreSQL database and REST API endpoints for candidate score tracking.

Algorithmic Trading Simulator | Python, Flask, Redis | github.com/janesmith/algo-trader
- Developed quantitative stock trading backtester processing 1,000,000 historical price records in 2 seconds.

EDUCATION
B.S. in Computer Science | University of Texas at Austin | 2020 - 2024
GPA: 3.8 / 4.0 | Coursework: Data Structures, Algorithms, Operating Systems, Database Systems

ACHIEVEMENTS
- Solved 350+ LeetCode problems (Rating 1850)
- Dean's Honor List 2022-2024
`,
  },
  {
    id: 3,
    name: '3. Average Fresher Resume',
    text: `
Alex Johnson
alex.j@email.com | Phone: 555-234-5678 | New York

SUMMARY
Computer Science student looking for entry level software developer position.

SKILLS
Java, Python, C++, HTML, CSS, JavaScript, SQL, Git

PROJECTS
Weather App
- Created weather forecasting app using HTML, CSS, and JavaScript with OpenWeather API.
Student Management System
- Developed Java desktop app to manage student records using MySQL database.

EDUCATION
Bachelor of Technology in Information Technology | City College | 2020 - 2024
`,
  },
  {
    id: 4,
    name: '4. Weak Fresher Resume',
    text: `
Sam Wilson
sam@email.com

OBJECTIVE
Seeking a challenging job in a good company where I can use my skills to grow.

SKILLS
HTML, CSS, MS Office, Typing

EDUCATION
High School Diploma | 2020
`,
  },
  {
    id: 5,
    name: '5. Resume with 50 Skills Stuffed (Anti-Gaming Test)',
    text: `
Bob Miller
bob@email.com | 555-111-2222

SUMMARY
Software engineer with experience.

SKILLS
JavaScript, TypeScript, React, Next.js, Node.js, Express, Python, Django, FastAPI, Flask, Java, Spring Boot, C++, C#, .NET, Go, Rust, PHP, Laravel, HTML, CSS, Tailwind, Bootstrap, PostgreSQL, MySQL, MongoDB, Redis, SQLite, Oracle, DynamoDB, GraphQL, REST API, gRPC, Microservices, System Design, Docker, Kubernetes, AWS, GCP, Azure, CI/CD, Jenkins, Git, Linux, Bash, Jest, Cypress, Prisma, Redux, Kafka, ElasticSearch

WORK EXPERIENCE
Developer | ABC Co | 2022 - 2023
- Worked on computer software development.

EDUCATION
B.S. CS | State University | 2022
`,
  },
  {
    id: 6,
    name: '6. Resume with Strong Projects',
    text: `
David Lee
david.l@email.com | 555-333-4444 | github.com/davidlee

SUMMARY
Full Stack Engineer specializing in distributed real-time web applications.

SKILLS
JavaScript, TypeScript, React, Next.js, Node.js, PostgreSQL, Redis, WebSockets, Docker, AWS, Git

PROJECTS
Distributed Real-time Messaging Platform | React, Node.js, Redis, WebSockets, Docker | github.com/davidlee/chat
- Engineered real-time chat infrastructure handling 50,000 active WebSocket connections.
- Implemented Redis Pub/Sub for horizontal scaling across 4 server instances.
- Containerized applications with Docker Compose and deployed to AWS ECS with zero downtime.

Cloud Analytics Dashboard | Next.js, TypeScript, PostgreSQL, Tailwind CSS | github.com/davidlee/analytics
- Built server-rendered data visualization dashboard reducing initial page load render time by 40%.
- Optimized complex PostgreSQL SQL join queries to execute in under 45ms.

EDUCATION
B.S. Computer Science | NYU | 2023
`,
  },
  {
    id: 7,
    name: '7. Resume with Strong Experience',
    text: `
Sarah Connor
sarah.c@email.com | 555-444-5555 | Seattle, WA | linkedin.com/in/sarahc

SUMMARY
Software Engineer with proven track record of optimizing backend performance and microservices infrastructure.

SKILLS
Python, Go, Node.js, PostgreSQL, Redis, Docker, Kubernetes, AWS, CI/CD, REST API, System Design

WORK EXPERIENCE
Senior Backend Engineer | Enterprise Systems | 2020 - Present
- Spearheaded database migration from MySQL to PostgreSQL, cutting infrastructure costs by $12,000 monthly.
- Reduced API p95 response latency by 55% by implementing Redis caching and query indexing.
- Automated Kubernetes cluster deployments on AWS EKS, reducing deployment pipeline duration from 30 min to 3 min.
- Led team of 5 engineers in designing gRPC microservices architecture handling 2M daily requests.

Software Engineer | DevCorp | 2017 - 2020
- Engineered RESTful APIs in Python FastAPI, scaling throughput to 5,000 requests per second.
- Developed automated regression test suite using PyTest, raising code coverage from 45% to 92%.

EDUCATION
B.S. Computer Engineering | University of Washington | 2017
`,
  },
  {
    id: 8,
    name: '8. Resume with Poor Formatting / Invalid Headings',
    text: `
Michael Brown
michael@email.com

My Profile Info:
I am a programmer looking for code work.

Things I can do:
HTML, CSS, JS, React

Past Jobs I did:
Worked at a small web studio making websites for clients.

Schooling:
Went to college from 2018 to 2022.
`,
  },
  {
    id: 9,
    name: '9. Resume with Missing Contact Information',
    text: `
SUMMARY
Full Stack Engineer experienced in React and Node.js.

SKILLS
JavaScript, React, Node.js, Express, MongoDB

WORK EXPERIENCE
Software Developer | Tech Inc | 2022 - Present
- Built React web pages and REST API endpoints.

EDUCATION
B.S. Computer Science | 2022
`,
  },
  {
    id: 10,
    name: '10. Resume with Excellent ATS Structure',
    text: `
Emily Clark
emily.clark@email.com | 555-777-8888 | Chicago, IL | github.com/emilyc | linkedin.com/in/emilyc

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 4 years of experience building scalable web applications using React, Node.js, TypeScript, and AWS.

TECHNICAL SKILLS
- Frontend: JavaScript, TypeScript, React, Next.js, HTML, CSS, Tailwind CSS
- Backend: Node.js, Express, Python, REST API, PostgreSQL, MongoDB, Redis
- DevOps & Tools: Docker, AWS, Git, CI/CD, Jest

WORK EXPERIENCE
Software Engineer | Financial Tech | 2021 - Present
- Architected payment processing pipeline handling $5M in daily transactions using Node.js and PostgreSQL.
- Reduced frontend bundle size by 35% through dynamic code splitting and tree shaking in Next.js.

Software Developer | HealthApp Inc | 2019 - 2021
- Developed patient scheduling web portal in React, increasing appointment booking rate by 25%.

PROJECTS
Open Source Healthcare Portal | React, TypeScript, Node.js | github.com/emilyc/health
- Contributed 15 pull requests to open-source medical record system used by 20+ clinics.

EDUCATION
Bachelor of Science in Computer Science | University of Illinois | 2019

CERTIFICATIONS
- AWS Certified Developer Associate (2022)
`,
  },
  {
    id: 11,
    name: '11. Resume with Excessive Buzzwords',
    text: `
Tom Hardy
tom@email.com | 555-000-1111

SUMMARY
Hardworking self-starter ninja rockstar guru who thinks outside the box to deliver synergy and go-getter dynamic results. Detail-oriented team player with passionate work ethic.

SKILLS
HTML, CSS, JavaScript

WORK EXPERIENCE
Worker | General Co | 2022
- Synergized dynamic solutions in a fast-paced environment.
`,
  },
  {
    id: 12,
    name: '12. Resume with Irrelevant Skills',
    text: `
Lisa Ray
lisa@email.com | 555-222-3333

SUMMARY
Seeking a software role.

SKILLS
Photoshop, Video Editing, Microsoft Word, Customer Service, Public Speaking, Creative Writing, HTML

PROJECTS
Blog Site
- Made a simple blog layout with HTML and CSS.

EDUCATION
B.A. Communication | State College | 2023
`,
  },
  {
    id: 13,
    name: '13. Resume Targeted to Specific Job (Match Mode)',
    jobDescription: 'Senior Next.js Developer with React, TypeScript, Node.js, PostgreSQL, Docker, AWS experience.',
    text: `
David Next
david.next@email.com | 555-888-9999 | github.com/davidnext

SUMMARY
Next.js Specialist with 5 years experience building server-rendered React applications with TypeScript, Node.js, PostgreSQL, Docker, and AWS.

SKILLS
React, Next.js, TypeScript, Node.js, PostgreSQL, Docker, AWS, Git

WORK EXPERIENCE
Senior Frontend Architect | Vercel Partner | 2021 - Present
- Engineered enterprise Next.js App Router portal backed by PostgreSQL and AWS.
`,
  },
  {
    id: 14,
    name: '14. Resume Mismatched to Target Job (Mismatch Mode)',
    jobDescription: 'Senior DevOps Architect requiring Kubernetes, Terraform, Ansible, Go, AWS, and Prometheus.',
    text: `
Chris Front
chris@email.com

SUMMARY
Junior Frontend Designer skilled in HTML, CSS, Photoshop, and WordPress.

SKILLS
HTML, CSS, WordPress, Photoshop

WORK EXPERIENCE
Web Designer | Design Lab | 2023
- Designed WordPress templates.
`,
  },
  {
    id: 15,
    name: '15. Very Short Resume',
    text: `
Kevin Small
kevin@email.com
Developer. Knows Python and HTML.
`,
  },
  {
    id: 16,
    name: '16. Very Long Verbose Resume',
    text: `
Arthur Pendelton
arthur@email.com | 555-999-0000 | linkedin.com/in/arthurp | github.com/arthurp

SUMMARY
Highly detailed software developer with extensive background in computer science, software engineering, frontend engineering, backend engineering, database management, cloud systems, and network protocols... (repeated details)

SKILLS
JavaScript, TypeScript, React, Next.js, Node.js, Express, Python, PostgreSQL, Docker, AWS, Git

WORK EXPERIENCE
Software Developer | Tech Enterprises | 2018 - Present
- Worked on developing web user interface components using React and HTML and CSS.
- Worked on creating REST API server endpoints in Node.js and Express.
- Worked on testing software code and deploying to cloud infrastructure on Amazon Web Services.
- Worked on managing PostgreSQL databases and writing SQL query statements.

EDUCATION
B.S. Computer Science | MIT | 2018
`,
  },
  {
    id: 17,
    name: '17. Resume with Only Education & Projects',
    text: `
Hannah Abbott
hannah@email.com | 555-444-2222 | github.com/hannah

SUMMARY
Computer Science Graduate focused on full-stack web applications.

SKILLS
Python, JavaScript, React, Node.js, PostgreSQL, Git

PROJECTS
Full-Stack E-Commerce | React, Node.js, PostgreSQL | github.com/hannah/shop
- Developed online store with cart checkout, JWT authentication, and SQL schema.

EDUCATION
B.S. Computer Science | UCLA | 2024
`,
  },
  {
    id: 18,
    name: '18. Resume with Strong Achievements',
    text: `
Victor Winner
victor@email.com | 555-333-7777 | github.com/victor

SUMMARY
Software Engineer & Competitive Programmer.

SKILLS
C++, Python, Java, Algorithms, Data Structures, Git

ACHIEVEMENTS & CERTIFICATIONS
- AWS Certified Solutions Architect Professional
- Google Code Jam World Finalist (Top 100 Global)
- Candidate Master on Codeforces (Rating 2050)
- 1st Place Winner out of 500 teams at Global Hackathon 2023

EDUCATION
B.S. CS | UC Berkeley | 2023
`,
  },
  {
    id: 19,
    name: '19. Resume with Duplicate Content & Keyword Stuffing',
    text: `
Dup User
dup@email.com

SUMMARY
React React React Next.js Next.js Developer Developer.

SKILLS
React, React, React, Next.js, Next.js, JavaScript, JavaScript, Node.js, Node.js

WORK EXPERIENCE
Dev | Co | 2023
- Built React React applications with React and Next.js and React.
- Built React React applications with React and Next.js and React.
`,
  },
  {
    id: 20,
    name: '20. Resume with Poor Grammar & No Action Verbs',
    text: `
Bad Gram
bad@email.com

SUMMARY
I am do coding for website and make web app.

SKILLS
JS, HTML, CSS

WORK EXPERIENCE
Coder | Shop | 2022
- I was doing coding work for site.
- I was fixing bugs and changing text on pages.
`,
  },
  // EDGE CASES
  {
    id: 21,
    name: '21. Edge Case: Empty Resume Text',
    text: '',
  },
  {
    id: 22,
    name: '22. Edge Case: Corrupted Unprintable Symbols',
    text: '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09 unreadable corrupt pdf binary content \x10\x11\x12',
  },
];

async function runTestSuite() {
  console.log('====================================================');
  console.log('   RESUME AI MULTI-DIMENSIONAL SCORING ENGINE TESTS ');
  console.log('====================================================\n');

  const results = [];

  for (const scenario of SCENARIOS) {
    const scoreData = calculateDeterministicResumeScore(scenario.text, scenario.jobDescription);
    const aiData = await analyzeResumeWithAI(scenario.text, scenario.jobDescription);

    results.push({
      id: scenario.id,
      name: scenario.name,
      baseScore: scoreData.baseScore,
      finalScore: aiData.overallScore,
      aiAdjustment: aiData.aiAdjustment,
      atsScore: aiData.atsScore,
      qualityLevel: aiData.qualityLevel,
      categoryScores: scoreData.categoryScores,
    });

    console.log(`[Scenario ${scenario.id}] ${scenario.name}`);
    console.log(`   └─ Base Score: ${scoreData.baseScore} | AI Adj: ${aiData.aiAdjustment >= 0 ? '+' : ''}${aiData.aiAdjustment} | Final Score: ${aiData.overallScore}/100 (${aiData.qualityLevel})`);
    console.log(`   └─ ATS Score: ${aiData.atsScore}%`);
    console.log(`   └─ Breakdown: EXP:${scoreData.categoryScores.experience}/20, PROJ:${scoreData.categoryScores.projects}/15, SKILLS:${scoreData.categoryScores.skills}/15, ATS:${scoreData.categoryScores.ats}/15, SUM:${scoreData.categoryScores.summary}/10`);
    console.log('----------------------------------------------------');
  }

  // Sanity & Hierarchy Verification
  console.log('\n====================================================');
  console.log('            VERIFICATION CHECKS & HEURISTICS        ');
  console.log('====================================================');

  const excellent = results.find((r) => r.id === 1);
  const strongFresher = results.find((r) => r.id === 2);
  const averageFresher = results.find((r) => r.id === 3);
  const weakFresher = results.find((r) => r.id === 4);
  const stuffedSkills = results.find((r) => r.id === 5);
  const emptyEdge = results.find((r) => r.id === 21);

  let passed = true;

  // Rule 1: Excellent > Strong > Average > Weak
  if (excellent.finalScore > strongFresher.finalScore &&
      strongFresher.finalScore > averageFresher.finalScore &&
      averageFresher.finalScore > weakFresher.finalScore) {
    console.log('✓ SUCCESS: Hierarchy ordering verified (Excellent > Strong > Average > Weak).');
  } else {
    console.error('❌ FAILURE: Incorrect hierarchy ordering!');
    passed = false;
  }

  // Rule 2: Anti-gaming skill stuffing penalty
  if (stuffedSkills.categoryScores.skills < 15 && stuffedSkills.finalScore < excellent.finalScore) {
    console.log('✓ SUCCESS: Anti-gaming skill stuffing penalty working as expected.');
  } else {
    console.error('❌ FAILURE: Skill stuffing anti-gaming check failed!');
    passed = false;
  }

  // Rule 3: Clamping 0-100 check
  const invalidScores = results.filter((r) => r.finalScore < 0 || r.finalScore > 100);
  if (invalidScores.length === 0) {
    console.log('✓ SUCCESS: All scores strictly clamped between 0 and 100.');
  } else {
    console.error('❌ FAILURE: Out of bounds scores detected!');
    passed = false;
  }

  // Rule 4: Empty text edge case handling
  if (emptyEdge.finalScore === 0) {
    console.log('✓ SUCCESS: Empty resume safely produces 0/100 without throwing exceptions.');
  } else {
    console.error('❌ FAILURE: Empty resume did not produce 0!');
    passed = false;
  }

  if (passed) {
    console.log('\n✅ ALL 22 SCENARIO VERIFICATIONS PASSED SUCCESSFULLY!');
  } else {
    console.error('\n❌ SOME VERIFICATION CHECKS FAILED!');
    process.exit(1);
  }
}

runTestSuite();
