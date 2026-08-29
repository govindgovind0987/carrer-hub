# CareerHub: AI-Powered Career Development & Hiring Platform
## Comprehensive PPT & Viva Reference Documentation

---

## 1. Project Overview

**CareerHub** is an enterprise-grade, full-stack AI career acceleration and hiring assessment platform designed to bridge the gap between job candidates and recruiters. Powered by **Next.js 16 (App Router)**, **React 19**, **Auth.js (NextAuth v5)**, **Prisma ORM**, **PostgreSQL**, and **Groq SDK (Llama 3.3 70B Versatile)**, CareerHub unifies the entire career lifecycle into a single intelligent workspace.

### Core Objective
To replace fragmented job preparation tools with a single data-driven platform that evaluates candidate profile metrics, audits resumes against ATS algorithms, delivers AI-driven mock interviews, executes multi-language coding assessment challenges, generates action-specific career strategies, and tracks overall career readiness.

### Target Users
1. **Job Candidates / Job Seekers**: Candidates aiming to optimize their resumes, practice technical/DSA coding challenges, rehearse mock interviews, and follow personalized learning roadmaps.
2. **Recruiters & Hiring Managers**: Organizations seeking to post job openings, build custom coding assessments, evaluate candidate submissions, and manage applicant pipelines.
3. **Administrators**: System managers overseeing platform users, audit logs, activity tracking, and system settings.

### Core Value Proposition
Unlike standard job boards or simple resume builders, CareerHub combines **10-category deterministic ATS resume scoring**, **Groq AI qualitative analysis**, **semantic job description matching**, **interactive mock interview simulation**, **multi-language online code judging (Python, Java, C++)**, and **9 action-specific AI Career Coach strategy engines**.

---

## 2. Problem Statement

Modern job seekers face significant hurdles in today's competitive technology job market:

1. **Resume & ATS Opacity**: Over 75% of resumes are filtered out by Automated Applicant Tracking Systems (ATS) due to poor formatting, missing technical keywords, or lack of quantified bullet points—without providing candidates actionable feedback.
2. **Job Discovery & Qualification Alignment Deficit**: Candidates waste time applying to roles without knowing their exact skill alignment or missing keyword gaps relative to the job description.
3. **Interview Anxiety & Lack of Realistic Simulation**: Technical and behavioral interviews cause high candidate drop-off due to insufficient practice with real-time feedback and structured scoring.
4. **Coding Competency & Algorithmic Practice Gap**: Candidates struggle to transition from theoretical computer science knowledge to live coding speed under time constraints.
5. **Generic & Non-Actionable Career Guidance**: Most online career tools offer static, generic advice rather than dynamic, data-driven action plans tailored to candidate data.

---

## 3. Proposed Solution

CareerHub solves these challenges through an integrated 6-pillar ecosystem:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CAREERHUB PLATFORM                              │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│    Pillar 1  │   Pillar 2   │   Pillar 3   │   Pillar 4   │     Pillar 5    │
│  Resume &    │ AI Job Match │ AI Mock      │ Online Code  │  AI Career      │
│  ATS Engine  │ Engine       │ Interviews   │ Assessment   │  Coach (9-in-1) │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┘
```

1. **Multi-Dimensional ATS Resume Audit**: Evaluates candidate PDF resumes across 10 deterministic categories (0–100 base score) combined with a bounded Groq AI qualitative audit.
2. **Semantic AI Job Matcher**: Compares uploaded resumes with job descriptions to compute a match score, highlight missing keywords, and provide instant bullet-point optimization recommendations.
3. **Interactive AI Mock Interview Engine**: Generates role-specific technical and behavioral questions, records candidate text/voice responses, and computes comprehensive multi-metric score reports.
4. **Multi-Language Online Coding Assessment**: Features an in-browser code editor (Monaco Editor) with execution and judging across Python, Java, and C++ with runtime and memory telemetry.
5. **9 Action-Specific AI Career Coach**: Delivers tailored advice, learning roadmaps, weakness analyses, interview prep, and 30/90-day execution plans based strictly on authentic candidate metrics.
6. **Unified Readiness Index & Skill Tracking**: Measures profile strength, resume readiness, technical readiness, DSA readiness, and interview readiness in a real-time progress dashboard.

---

## 4. Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- **Purpose**: Secure user sign-up, sign-in, and session management for Candidates, Recruiters, and Admins.
- **User Flow**: User signs up with email/password → Auth.js creates JWT session → Role determines dashboard permissions.
- **AI Involvement**: None (Deterministic security).
- **Output**: Authenticated JWT session stored in HTTP-only cookies.

### 2. Candidate Profile & Resume Management
- **Purpose**: Centralized candidate portfolio tracking skills, experiences, education, projects, and PDF resume versions.
- **User Flow**: Candidate fills profile form → Uploads PDF resume → Files are stored in Cloudinary/filesystem → Parsed using `pdf-parse`.
- **AI Involvement**: Extracted raw resume text is ingested into AI analysis pipelines.
- **Output**: Multi-version resume records with default selection toggle.

### 3. AI Resume Score & ATS Analysis Engine
- **Purpose**: Comprehensive multi-dimensional evaluation of resume quality and ATS parser compatibility.
- **User Flow**: Candidate requests resume audit → 10-category deterministic scoring engine calculates base score (0–100) → Groq LLM performs qualitative audit adjustment ([-5, +5]).
- **AI Involvement**: Groq SDK (`llama-3.3-70b-versatile`) evaluates writing quality, impact metrics, and section flow.
- **Output**: Overall ATS score, keyword analysis, strong areas, weak areas, grammar suggestions, formatting tips, and career trajectory advice.

### 4. AI Job Matching Engine
- **Purpose**: Instant alignment assessment between candidate resume and specific job descriptions.
- **User Flow**: Candidate selects resume and target job posting → AI compares skills and requirements → Generates match breakdown.
- **AI Involvement**: Groq LLM evaluates semantic compatibility, missing technologies, and bullet-point rewrite advice.
- **Output**: Match score (0–100%), candidate vs job title comparison, missing high-value skills, and tailored application advice.

### 5. AI Mock Interview Platform
- **Purpose**: Realistic technical and HR behavioral interview practice with automated multi-metric scoring.
- **User Flow**: Candidate configures role, technology, difficulty, and question count → AI generates custom interview questions → Candidate submits text/voice answers → AI computes detailed score report.
- **AI Involvement**: Question generation, answer evaluation, correctness scoring, communication assessment, and weakness extraction.
- **Output**: Overall score, technical/coding/communication scores, question-by-question breakdown, strengths, weaknesses, and recommended study topics.

### 6. Online Coding Assessment & Problem Judge
- **Purpose**: Algorithmic problem solving and code execution platform similar to LeetCode.
- **User Flow**: Candidate selects problem → Writes code in Monaco Editor (Python, Java, C++) → Runs test cases → Submits for final verdict.
- **AI Involvement**: Optional AI assistance hint generator; code execution is handled by deterministic judge engines.
- **Output**: Verdict (`ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`), runtime (ms), memory (MB), test cases passed count, streak days, and points.

### 7. HR & Technical Question Bank
- **Purpose**: Curated repository of interview questions organized by category (JavaScript, React, Next.js, Node.js, SQL, DSA, HR, Behavioral).
- **User Flow**: Candidate browses questions → Views sample answers, key points, common mistakes, and follow-ups → Bookmarks questions for review.
- **AI Involvement**: Question generation and sample answer synthesis.
- **Output**: Detailed study cards with bookmarking capabilities.

### 8. Action-Specific AI Career Coach
- **Purpose**: Dynamic career advisor delivering action-specific strategy outputs across 9 distinct buttons.
- **User Flow**: Candidate clicks any of the 9 action buttons → Backend normalizes actionType and passes authentic DB metrics → AI generates action-specific JSON response → UI renders specialized view.
- **AI Involvement**: Custom Groq LLM prompt engineering per action with schema enforcement.
- **Output**: Specialized visual rendering for Skill Assessment, Learning Roadmap, What to Learn Next, Weak Areas, Interview Prep, Resume Improvement, Technical Skills, 30-Day Plan, and 90-Day Plan.

---

## 5. Complete User Journey

```
 ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
 │ 1. Auth & Sign │ ──> │ 2. Setup       │ ──> │ 3. Upload      │ ──> │ 4. ATS Resume  │
 │    Up / Login  │     │    Profile     │     │    PDF Resume  │     │    Analysis    │
 └────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘
                                                                               │
 ┌────────────────┐     ┌────────────────┐     ┌────────────────┐              │
 │ 8. AI Career   │ <── │ 7. Online Code │ <── │ 6. AI Mock     │ <────────────┘
 │    Coach Plan  │     │    Assessment  │     │    Interview   │
 └────────────────┘     └────────────────┘     └────────────────┘
         │
         ▼
 ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
 │ 9. Skill &     │ ──> │ 10. Job Match  │ ──> │ 11. Recruiter  │
 │    Milestones  │     │     & Apply    │     │     Pipeline   │
 └────────────────┘     └────────────────┘     └────────────────┘
```

---

## 6. Technology Stack

| Technology | Purpose | Actual Codebase Usage |
| :--- | :--- | :--- |
| **Next.js 16.2.10** | Full-Stack Web Framework | App Router, Server Components, API Routes, Server Actions |
| **React 19.2.4** | UI Component Library | Dynamic client state, interactive dashboards, hooks |
| **Auth.js (NextAuth v5)** | Authentication Middleware | JWT session tokens, Credentials Provider, HTTP-only cookies |
| **Prisma ORM 7.8.0** | Database Modeling & Client | Type-safe PostgreSQL queries, migrations, multi-table relations |
| **PostgreSQL / pg** | Relational Database Engine | Storage of user profiles, resumes, test cases, and interview sessions |
| **Groq SDK 1.3.0** | High-Speed LLM Inference API | `llama-3.3-70b-versatile` model for JSON-mode qualitative analysis |
| **TailwindCSS v4** | UI Styling System | Modern dark/light glassmorphism, responsive grid layouts |
| **Monaco Editor** | In-Browser Code Editor | Interactive code editor in Coding Assessment platform |
| **Lucide React** | Modern Vector Icon Set | Dashboard icons, metric cards, status badges |
| **pdf-parse 2.4.5** | Resume Parsing Engine | Extracting raw text from uploaded PDF resume documents |
| **Cloudinary / FS** | Media Asset Storage | Resume PDF and avatar image hosting |
| **bcryptjs 3.0.3** | Password Security | One-way salt hashing for user account passwords |
| **Zod 4.4.3** | Schema Validation | Server action and API payload validation |

---

## 7. System Architecture

```
                                  +-------------------+
                                  |   Candidate /     |
                                  |   Recruiter UI    |
                                  +---------+---------+
                                            |
                                            v
                                  +-------------------+
                                  | Next.js App Router|
                                  | (Server/Client)   |
                                  +---------+---------+
                                            |
                       +--------------------+--------------------+
                       |                                         |
                       v                                         v
            +--------------------+                    +--------------------+
            | Next.js API Routes |                    | Server Actions     |
            | (/api/career-coach)|                    | (actions/*.js)     |
            +----------+---------+                    +----------+---------+
                       |                                         |
                       +--------------------+--------------------+
                                            |
                                            v
                                  +-------------------+
                                  | Business Logic &  |
                                  | Service Layer     |
                                  +---------+---------+
                                            |
                       +--------------------+--------------------+
                       |                                         |
                       v                                         v
            +--------------------+                    +--------------------+
            | Groq AI SDK        |                    | PostgreSQL DB      |
            | (Llama 3.3 70B)    |                    | (via Prisma ORM)   |
            +--------------------+                    +--------------------+
```

---

## 8. Frontend Architecture

- **App Router Layout Hierarchy**:
  - `app/layout.js`: Global root wrapper providing ThemeProvider, Auth Session Provider, and Toast containers.
  - `app/(dashboard)/layout.js`: Authenticated dashboard wrapper with sidebar navigation and header bar.
- **Component Design System**: Built with modular shadcn/ui components (`Card`, `Button`, `Badge`, `Progress`, `Tabs`, `Dialog`).
- **State Management**: React `useState` and `useTransition` for responsive local state; server actions for asynchronous data revalidation.
- **Monaco Editor Integration**: Embedded `@monaco-editor/react` in coding assessment routes for syntax highlighting and tab formatting.

---

## 9. Backend Architecture

- **Server Actions (`actions/`)**: Direct server-side execution for authentication (`auth.js`), profile updates (`profile.js`), resume uploading (`resume.js`), mock interview sessions (`interview.js`), job management (`job.js`), and admin tasks (`admin.js`).
- **API Routes (`app/api/`)**:
  - `/api/career-coach`: Receives `actionType`, compiles candidate metrics from PostgreSQL, queries Groq AI, and returns action-specific JSON.
  - `/api/assessment/execute` & `/api/assessment/submit`: Evaluates candidate code submissions against hidden problem test cases.
  - `/api/upload`: Handles multi-part PDF resume uploads and Cloudinary integration.
- **Middleware & Auth Security**: Auth.js session verification ensures unauthenticated requests to protected endpoints return HTTP 401.

---

## 10. Database Architecture

### Simplified Entity-Relationship (ER) Diagram

```
+------------------+         1:1         +------------------+
|       User       | ------------------> |     Profile      |
+--------+---------+                     +--------+---------+
         |                                        | 1:N
         | 1:N                                    +--------> Experience, Skill, Project, Education
         v
+------------------+         1:N         +------------------+
|      Resume      | ------------------> |  ResumeAnalysis  |
+--------+---------+                     +------------------+
         |
         | 1:N
         v
+------------------+         1:N         +------------------+
|   Application    | <------------------ |       Job        |
+------------------+                     +------------------+
                                                  ^
                                                  | 1:N
                                         +--------+---------+
                                         |     Company      |
                                         +------------------+

+------------------+         1:N         +------------------+
| InterviewSession | ------------------> | InterviewReport  |
+------------------+                     +------------------+

+------------------+         1:N         +------------------+
|     Problem      | ------------------> | ProblemSubmission|
+------------------+                     +------------------+
```

### Core Models Summary
- `User`: Primary account record (`id`, `email`, `hashedPassword`, `role`).
- `Profile`: Candidate professional background details, social links, headline, and bio.
- `Resume` & `ResumeAnalysis`: Stored PDF metadata and ATS scoring reports.
- `Job` & `Application`: Recruiter listings and candidate application tracking.
- `InterviewSession` & `InterviewReport`: Mock interview state and evaluation reports.
- `Problem`, `TestCase`, & `ProblemSubmission`: Online coding assessment schema.
- `UserCodingStats`: Cumulative solved problem counts, streaks, and points.

---

## 11. AI Integration Architecture

### AI Provider & Model
- **Provider**: Groq Cloud SDK (`groq-sdk`)
- **Model**: `llama-3.3-70b-versatile`
- **Output Format**: Enforced raw JSON mode (`response_format: { type: "json_object" }`).

### Prompt Engineering & JSON Validation Architecture
Every AI invocation uses structured system prompts requiring valid raw JSON without markdown codeblocks.

```javascript
// Example JSON Execution Pattern
const response = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [
    { role: 'system', content: 'You are an enterprise AI assistant for CareerHub. Always return valid raw JSON.' },
    { role: 'user', content: prompt }
  ],
  temperature: 0.2,
  response_format: { type: 'json_object' }
});
```

### Fallback Reliability Engine
If Groq API calls timeout, fail, or return unexpected schemas, CareerHub automatically triggers **action-specific deterministic fallback generators** powered by authentic candidate PostgreSQL data.

---

## 12. Resume Analysis & ATS Scoring Engine

CareerHub uses a **hybrid dual-layer scoring architecture**:

```
+------------------------------------+      +------------------------------------+
| 1. Deterministic Base Engine (0-100)|  +   | 2. Groq AI Qualitative Audit ([-5, +5])|
| - Work Experience & Impact Metrics |      | - Writing Quality & Trajectory     |
| - Technical Skills Categorization  |      | - Project Complexity & Clarity     |
| - Education & Formatting Checks    |      |                                    |
+------------------------------------+      +------------------------------------+
                                  \            /
                                   v          v
                       +----------------------------------+
                       | Final Clamped ATS Score (0 - 100)|
                       +----------------------------------+
```

### 10-Category Deterministic Breakdown
1. **Work Experience Score** (0–20 pts)
2. **Projects Score** (0–15 pts)
3. **Skills Score** (0–15 pts)
4. **Education Score** (0–10 pts)
5. **Formatting & Structure Score** (0–10 pts)
6. **Quantified Impact Metrics Score** (0–10 pts)
7. **Contact Information Completeness** (0–5 pts)
8. **Resume Length Suitability** (0–5 pts)
9. **Action Verbs Variety** (0–5 pts)
10. **Section Header Standard Compliance** (0–5 pts)

---

## 13. AI Job Matching Engine

- **Input Data**: Candidate uploaded PDF resume text + Recruiter target job description text.
- **Matching Algorithm**:
  1. Groq LLM evaluates semantic alignment across title, technical stack, and years of experience.
  2. Compares detected keywords in resume against high-value keywords in job description.
- **Output Schema**:
  - `matchScore`: Integer (0–100%)
  - `candidateTitle` vs `jobTitle`
  - `missingSkills`: Array of missing high-value tech skills
  - `recommendedSkills`: Array of recommended skills to add
  - `suggestions`: Specific resume bullet-point adjustment advice

---

## 14. AI Mock Interview Engine

1. **Configuration**: Candidate chooses Role (e.g., Full Stack Engineer), Technology Stack (React, Node.js), Difficulty (Easy, Medium, Hard), Duration, and Question Count.
2. **Question Generation**: Groq LLM generates targeted questions covering technical concepts, DSA patterns, project architecture, and behavioral STAR scenarios.
3. **Response Submission**: Candidate submits text answers or voice transcriptions per question.
4. **Evaluation Engine**: AI evaluates each answer for correctness, technical depth, communication clarity, problem solving, and confidence.
5. **Report Generation**: Produces an `InterviewReport` record with overall score, category breakdown, strengths, weaknesses, missing concepts, and targeted preparation recommendations.

---

## 15. Online Coding Assessment System

- **Problem Schema**: Each `Problem` has a difficulty level, category (e.g., Arrays, Two Pointers, Graphs), constraints, examples, starter code (Python, Java, C++), reference solutions, and test cases.
- **Execution & Judging Architecture**:
  - Code submitted by user is validated against hidden test cases.
  - Returns `Verdict`: `ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`, `MEMORY_LIMIT_EXCEEDED`, or `COMPILATION_ERROR`.
- **User Coding Telemetry**: Updates `UserCodingStats` record with total solved count, easy/medium/hard breakdown, streak days, and points.

---

## 16. HR & Technical Question Bank

- **Categories**: JavaScript, React, Next.js, Node.js, MongoDB, SQL, DSA, HR, Behavioral, Technical.
- **Content Structure**: Every question includes a detailed model answer, key concepts, common mistakes to avoid, interviewer tips, and optional follow-up questions.
- **User Interactivity**: Candidates can search, filter by category/difficulty, and toggle bookmarks.

---

## 17. AI Career Coach (9 Action-Specific Modules)

The AI Career Coach provides 9 explicit strategy actions:

| Action # | Action Label | Action Key | Specific AI Output Schema & Rendered View |
| :--- | :--- | :--- | :--- |
| **1** | **Analyze My Skills** | `analyze-skills` | Overall Assessment, Verified Strong Skills, Skills Needing Improvement, Missing Stack Gaps, Priority Recommendations, Suggested Next Actions |
| **2** | **Create My Learning Roadmap** | `learning-roadmap` | Level & Target Role Banner, Key Priorities, Multi-Phase Structured Roadmap (Phases 1–3), Execution Sequence |
| **3** | **What Should I Learn Next?** | `learn-next` | Learn This First Spotlight, Subsequent Priority Skills, Practice Recommendation |
| **4** | **Find My Weak Areas** | `weak-areas` | Weakness & Severity Matrix (High/Medium/Low tags, Empirical Evidence callouts, Strategic Impact, How To Improve) |
| **5** | **Prepare Me for Interviews** | `interview-prep` | Technical Interview Topics, High-Yield DSA Patterns, Project Deep-Dive Questions, Resume Experience Questions, HR STAR Behavioral Questions |
| **6** | **Improve My Resume** | `improve-resume` | Resume Strengths vs Areas to Fix, High-Value Missing Keywords, Experience & Project Bullet Point Rewrites, Immediate Fixes |
| **7** | **Improve My Technical Skills** | `technical-skills` | Current Technical Level Banner, Strong vs Weak Technical Areas, Recommended Technologies, Practice Projects, Milestones |
| **8** | **Create 30-Day Plan** | `30-day-plan` | 4 Weekly Breakdown Period Cards (Days 1–7, 8–14, 15–21, 22–30) with tasks, coding practice, resume work, interview prep, and goals |
| **9** | **Create 90-Day Plan** | `90-day-plan` | 3 Monthly Phase Cards (Days 1–30, 31–60, 61–90) with strategic focus, technical development, DSA focus, project work, and milestones |

---

## 18. Learning & Skill Progress

CareerHub calculates real-time candidate readiness indexes across 5 categories:

$$\text{Overall Career Readiness Score} = (0.20 \times \text{ProfileStrength}) + (0.25 \times \text{ResumeReadiness}) + (0.25 \times \text{TechnicalReadiness}) + (0.30 \times \text{InterviewReadiness})$$

- **Profile Strength** (0–100%): Calculated from profile completeness (bio, skills, experiences, projects, educations).
- **Resume Readiness** (0–100%): Latest ATS score or default parsing score.
- **DSA Readiness** (0–100%): Percentage benchmark based on solved coding challenges ($(\text{solvedCount} / 20) \times 100$).
- **Technical Readiness** (0–100%): Combined metric of DSA solved count and listed skills count.
- **Interview Readiness** (0–100%): Average score across all completed mock interview reports.

---

## 19. Authentication & Security

- **NextAuth v5 (Auth.js)**: Configured with Credentials Provider in `lib/auth.js`.
- **Password Security**: Passwords hashed using `bcryptjs` (salt rounds: 10).
- **Route Protection**: Next.js network middleware redirects unauthenticated users away from `/dashboard/*` routes.
- **Environment API Key Isolation**: Groq API keys (`GROQ_API_KEY`) and database credentials (`DATABASE_URL`) are strictly stored server-side.
- **Data Validation**: API routes validate incoming JSON payloads with Zod schemas to reject malicious inputs.

---

## 20. API Documentation

| Method | Endpoint | Purpose | Auth Required | Input | Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/[...nextauth]` | Auth.js login/logout/session handlers | No | User Credentials | JWT Token / Session Cookie |
| **POST** | `/api/upload` | PDF resume upload & parsing | Yes | Multipart FormData (PDF) | Saved Resume Record & Parsed Text |
| **POST** | `/api/career-coach` | Execute action-specific AI Career Coach | Yes | `{ actionType: string }` | Action-Specific Strategy JSON |
| **GET** | `/api/assessment/problems` | List coding assessment problems | Yes | Query params (`difficulty`, `category`) | Array of `Problem` records |
| **POST** | `/api/assessment/execute` | Test run code against sample inputs | Yes | `{ problemId, code, language }` | Test execution results |
| **POST** | `/api/assessment/submit` | Submit code for full evaluation | Yes | `{ problemId, code, language }` | Final `Verdict`, test case scores |

---

## 21. Important Project Files

| File / Folder | Responsibility | Technical Importance |
| :--- | :--- | :--- |
| [`app/api/career-coach/route.js`](file:///c:/Users/arhai/OneDrive/Documents%20-%20Copy/resumeai/app/api/career-coach/route.js) | AI Career Coach API Route | Validates actionType, compiles DB candidate metrics, routes to AI |
| [`services/ai.js`](file:///c:/Users/arhai/OneDrive/Documents%20-%20Copy/resumeai/services/ai.js) | Core Groq LLM Service Engine | Contains LLM completions, 9 action prompts, and deterministic fallbacks |
| [`services/resume-score-engine.js`](file:///c:/Users/arhai/OneDrive/Documents%20-%20Copy/resumeai/services/resume-score-engine.js) | Deterministic ATS Scoring Engine | Evaluates 10 base resume categories (0–100 score) |
| [`app/(dashboard)/dashboard/career-coach/career-coach-client.js`](file:///c:/Users/arhai/OneDrive/Documents%20-%20Copy/resumeai/app/(dashboard)/dashboard/career-coach/career-coach-client.js) | AI Career Coach Client Component | Manages action selection and renders 9 distinct UI views |
| [`prisma/schema.prisma`](file:///c:/Users/arhai/OneDrive/Documents%20-%20Copy/resumeai/prisma/schema.prisma) | Complete Database Schema | Defines 28 Prisma models, enums, and relations |
| [`lib/auth.js`](file:///c:/Users/arhai/OneDrive/Documents%20-%20Copy/resumeai/lib/auth.js) | Auth.js Configuration | Handles user session tokens and credentials validation |

---

## 22. Error Handling & Reliability

- **Invalid API Action Inputs**: Requests with unrecognized `actionType` strings are rejected with HTTP 400 validation errors.
- **AI API Failures & Offline Mode**: Built-in deterministic fallback generators construct structured candidate responses using PostgreSQL data if Groq API is unavailable.
- **Database Failure Fallbacks**: Default values and empty array initializations prevent application crashes.
- **UI Error Boundaries**: Client-side loading indicators, skeleton states, and Sonner toast alerts inform users of network errors.

---

## 23. Performance & Optimization

- **Parallel Database Execution**: Server components and API routes query PostgreSQL concurrently using `Promise.all()`.
- **Server Components & Reduced Client Bundle**: Heavy data fetching is executed on the server, serving static HTML and minimal JavaScript to the client.
- **Turbopack Build Optimization**: Utilizes Next.js 16 package import optimization (`optimizePackageImports`).

---

## 24. Testing & Validation

- **Static Code Analysis**: Enforced zero ESLint syntax or React compiler errors (`npm run lint`).
- **Production Build Compilation**: Verified code compilation via Next.js build pipeline (`npm run build`).
- **Direct Schema & Execution Tests**: Automated test runner ([`scratch/test-career-coach.js`](file:///C:/Users/arhai/.gemini/antigravity-ide/brain/ed298acd-be2b-4568-b2fb-4878e20756ef/scratch/test-career-coach.js)) verified output key structures for all 9 career coach actions.

---

## 25. Deployment Configuration

- **Build Target**: Next.js 16 Node.js Server deployment.
- **Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string.
  - `AUTH_SECRET`: Secret key for JWT signing.
  - `GROQ_API_KEY`: API key for Groq Cloud LLM inference.
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Media storage configurations.

---

## 26. Project Folder Structure

```
careerhub/
├── actions/                  # Next.js Server Actions (auth, resume, interview, profile, etc.)
├── app/                      # Next.js App Router Pages & API Routes
│   ├── (auth)/               # Authentication pages (sign-in, sign-up)
│   ├── (dashboard)/          # Dashboard pages (career-coach, assessment, resumes, etc.)
│   ├── (public)/             # Public pages (jobs, companies)
│   └── api/                  # API routes (career-coach, upload, assessment)
├── components/               # React UI components (shadcn ui, layout, forms)
├── constants/                # Prompts & system constants (prompts.js)
├── lib/                      # Framework integrations (auth.js, prisma.js, compiler engines)
├── prisma/                   # Prisma schema & database seeds
│   └── schema.prisma
├── public/                   # Static media assets
├── services/                 # Business logic & AI engines (ai.js, resume-score-engine.js)
├── package.json              # Project manifest and dependencies
└── PPT_README.md             # Project presentation & viva guide
```

---

## 27. Technical Challenges & Solutions

### Challenge 1: LLM Output Inconsistency Across Multiple Actions
- **Issue**: Standard LLMs often return unstructured plain text or generic responses regardless of the action selected.
- **Solution**: Implemented Groq JSON mode (`response_format: { type: "json_object" }`), explicit prompt schemas per action, and canonical `actionType` normalization.

### Challenge 2: Offline Resilience & High Availability
- **Issue**: Third-party AI API rate limits or outages cause application crashes.
- **Solution**: Developed 9 candidate-data-driven deterministic fallbacks in `services/ai.js` that compute structured feedback directly from PostgreSQL DB metrics.

### Challenge 3: Realistic Multi-Dimensional Resume Scoring
- **Issue**: Pure LLM resume evaluation produces variable scores on identical resumes.
- **Solution**: Created a 10-category deterministic base engine (0–100 score) paired with a secondary bounded Groq AI qualitative audit (clamped between [-5, +5]).

---

## 28. Innovation & Unique Value

CareerHub stands apart from traditional career tools by integrating **6 complementary career pillars into a single data-driven loop**:

$$\text{Resume Audit} \longrightarrow \text{Job Match} \longrightarrow \text{Mock Interview} \longrightarrow \text{Coding Assessment} \longrightarrow \text{AI Coach Strategy} \longrightarrow \text{Skill Progress}$$

Insights from coding problem failures directly inform the candidate's weak areas in the AI Career Coach, while missing resume keywords dynamically shape interview preparation topics.

---

## 29. Live Demo Presentation Sequence

1. **Slide 1–2: Introduction & Problem Statement**: Highlight ATS resume rejection rates and interview preparation gaps.
2. **Slide 3–4: Architecture & Solution Overview**: Show the 6-pillar ecosystem powered by Next.js 16, PostgreSQL, and Groq SDK.
3. **Demo Step 1 — ATS Resume Audit**: Show PDF resume upload, 10-category deterministic base score, and Groq AI keyword analysis.
4. **Demo Step 2 — AI Job Matcher**: Demonstrate matching candidate resume against job description to extract missing skills.
5. **Demo Step 3 — AI Mock Interview**: Configure a mock technical interview, submit an answer, and generate the score report.
6. **Demo Step 4 — Online Coding Assessment**: Solve a coding challenge in Monaco Editor and execute against test cases.
7. **Demo Step 5 — Action-Specific AI Career Coach**: Click distinct action buttons (*"Analyze My Skills"*, *"Create My Learning Roadmap"*, *"Find My Weak Areas"*) and highlight how prompt structures and rendered card views dynamically change.
8. **Slide 14–15: Conclusion & Q&A**: Present technical achievements and open the floor for Viva Q&A.

---

## 30. PPT Slide Structure (15 Slides)

| Slide # | Slide Title | Core Bullet Points | Visual / Diagram Suggestion |
| :--- | :--- | :--- | :--- |
| **Slide 1** | **Title Slide** | CareerHub: AI-Powered Career Development & Hiring Platform | High-level platform hero graphic |
| **Slide 2** | **Problem Statement** | ATS rejection opacity, job alignment gaps, interview anxiety, coding verification | 4-box problem grid diagram |
| **Slide 3** | **Proposed Solution** | Integrated 6-pillar career ecosystem | 6-pillar architectural diagram |
| **Slide 4** | **Technology Stack** | Next.js 16, React 19, Auth.js v5, Prisma ORM, PostgreSQL, Groq SDK | Tech stack logo grid & table |
| **Slide 5** | **System Architecture** | App Router, Server Actions, Groq LLM API, PostgreSQL Database | Full ASCII architecture diagram |
| **Slide 6** | **Database Design** | Prisma schema models: User, Profile, Resume, Job, Interview, Problem | Simplified Entity-Relationship diagram |
| **Slide 7** | **ATS Resume Audit Engine** | 10-category deterministic base engine (0–100) + bounded Groq AI audit ([-5, +5]) | Dual-layer scoring flow diagram |
| **Slide 8** | **AI Job Matching Engine** | Semantic resume vs job description comparison, match score, missing skills | Job match UI screenshot |
| **Slide 9** | **AI Mock Interview System** | Role/tech config, question generation, answer evaluation, metric score reports | Interview report breakdown UI |
| **Slide 10** | **Online Coding Assessment** | Monaco Editor, multi-language support (Python, Java, C++), test case judge | Coding environment screenshot |
| **Slide 11** | **AI Career Coach (9 Actions)** | 9 action-specific AI prompts, custom JSON schemas, candidate-data fallbacks | 9-action button grid & view mockup |
| **Slide 12** | **Skill & Readiness Dashboard** | Overall Career Readiness Index formula ($0.20 P + 0.25 R + 0.25 T + 0.30 I$) | Radial readiness progress bars |
| **Slide 13** | **Security & Error Handling** | Auth.js JWT authentication, bcryptjs hashing, action validation, fallback engines | Security architecture chart |
| **Slide 14** | **Future Enhancements** | Voice-to-text interview speech processing, real-time live coding collaboration | Roadmap timeline graphic |
| **Slide 15** | **Conclusion & Q&A** | Summary of platform achievements & open for viva questions | Thank you & Q&A prompt |

---

## 31. Verified Project Results

- **9 Action-Specific AI Coach Views**: Verified 100% action schema differentiation across all 9 buttons.
- **Dual-Layer Resume Scoring**: Successfully combines 10 deterministic categories with Groq AI qualitative auditing.
- **Code Execution Engine**: Supports multi-language test case evaluation for Python, Java, and C++.
- **Zero ESLint Errors**: Verified static code quality compliance.

---

## 32. Future Enhancements

1. **Real-Time Voice Speech Processing**: Incorporating Web Speech API for real-time speech-to-text during mock interviews.
2. **Collaborative Live Coding Sessions**: Adding WebSockets (Socket.io) for real-time recruiter-candidate pair programming interviews.
3. **Automated Job Scraping Engine**: Integrating background crawlers to ingest active job listings from global boards.
4. **Video Interview Recording & Emotion Analytics**: Storing candidate video feeds for AI facial/body language confidence auditing.

---

## 33. Conclusion

CareerHub successfully replaces fragmented career tools with a unified full-stack platform. By combining deterministic scoring precision with Groq AI qualitative evaluation, multi-language code execution, and 9 action-specific AI Career Coach strategy views, CareerHub empowers candidates to accelerate their job readiness while giving recruiters data-driven candidate evaluation tools.

---

## 34. Viva Questions & Answers (20 Key Questions)

### Q1: What is the main objective of CareerHub?
**Answer**: CareerHub is an integrated AI career development platform that unifies ATS resume scoring, semantic job matching, AI mock interviews, multi-language coding assessments, action-specific career coaching, and skill readiness tracking into a single ecosystem.

### Q2: Why did you choose Next.js 16 App Router for this project?
**Answer**: Next.js 16 App Router provides hybrid server-side rendering (SSR), server actions for type-safe backend mutation, automatic code splitting, optimized package imports, and unified API routing within a modern React 19 framework.

### Q3: How does the ATS Resume Scoring Engine work?
**Answer**: It uses a hybrid dual-layer approach. First, a 10-category deterministic engine evaluates experience, skills, projects, formatting, and metrics for a 0–100 base score. Then, Groq AI performs a qualitative audit providing a bounded adjustment strictly between -5 and +5 points.

### Q4: How is candidate authentication handled in CareerHub?
**Answer**: Authentication is managed via Auth.js (NextAuth v5) using a Credentials Provider with `bcryptjs` one-way password hashing and HTTP-only JWT session cookies.

### Q5: What LLM provider and model are used for AI features?
**Answer**: We use the Groq Cloud SDK running the `llama-3.3-70b-versatile` model configured with raw JSON mode (`response_format: { type: "json_object" }`).

### Q6: How do you ensure the AI does not fail if Groq API is offline?
**Answer**: We built 9 action-specific deterministic fallback generators in `services/ai.js` that aggregate candidate PostgreSQL data (solved DSA problems, ATS scores, weak areas) to construct structured responses if Groq is unavailable.

### Q7: How does the AI Career Coach differentiate between its 9 action buttons?
**Answer**: Incoming `actionType` identifiers are normalized in the backend. Each action triggers a distinct system prompt, requires a specialized JSON schema, and renders a unique dynamic UI view in the client.

### Q8: What database and ORM are used in this project?
**Answer**: We use PostgreSQL as the relational database engine managed via Prisma ORM 7.8.0 with `@prisma/adapter-pg`.

### Q9: How are PDF resumes parsed when uploaded by users?
**Answer**: Resumes uploaded via multipart requests are processed using `pdf-parse` to extract raw text content for keyword analysis and AI prompt ingestion.

### Q10: How does the Online Coding Assessment execute candidate code?
**Answer**: The user writes code in Monaco Editor. The backend compiles and executes the solution against test cases stored in PostgreSQL, returning runtime (ms), memory (MB), and a final `Verdict` (`ACCEPTED`, `WRONG_ANSWER`, etc.).

### Q11: What is the formula for the Overall Career Readiness Score?
**Answer**: $\text{Overall Score} = 0.20(\text{ProfileStrength}) + 0.25(\text{ResumeReadiness}) + 0.25(\text{TechnicalReadiness}) + 0.30(\text{InterviewReadiness})$.

### Q12: How are candidate roles and permissions enforced?
**Answer**: User roles (`CANDIDATE`, `RECRUITER`, `ADMIN`) are stored in the `User` model and checked in Server Actions and page middleware to restrict unauthorized access.

### Q13: What is the purpose of the AI Job Matching Engine?
**Answer**: It compares candidate resume text with job descriptions to compute a match score (0–100%), list missing high-value tech skills, and suggest bullet-point rewrites.

### Q14: How does the AI Mock Interview system score candidate answers?
**Answer**: AI evaluates candidate responses across technical correctness, communication clarity, problem-solving depth, and confidence, generating an overall score and category breakdown report.

### Q15: Why use Monaco Editor for the coding assessment?
**Answer**: Monaco Editor provides VS Code-like syntax highlighting, line numbering, code formatting, and multi-language editing directly inside web browsers.

### Q16: What security measures protect API keys?
**Answer**: Environment variables (`GROQ_API_KEY`, `DATABASE_URL`) are strictly scoped server-side and never exposed to client-side bundles.

### Q17: How does CareerHub handle form state and client validation?
**Answer**: Client forms use `react-hook-form` paired with `Zod` schemas for client-side and server-side validation.

### Q18: What is the role of Prisma database models like `UserProblemProgress` and `UserCodingStats`?
**Answer**: `UserProblemProgress` tracks per-problem attempt status and saved code snippets, while `UserCodingStats` stores cumulative metrics like total solved count, difficulty breakdown, points, and active streaks.

### Q19: How did you solve ESLint and build compliance?
**Answer**: We resolved all JSX unescaped entity warnings, missing React hook dependencies, and type errors, ensuring `npm run lint` completes with zero errors.

### Q20: What are the primary future enhancements planned for CareerHub?
**Answer**: Real-time Web Speech voice processing for mock interviews, WebSocket-powered pair programming live coding rounds, and automated job crawling integrations.
