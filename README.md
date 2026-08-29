# CareerHub — Enterprise AI Hiring & Coding Assessment Platform

CareerHub is a production-ready Next.js 16 hiring and skill assessment platform engineered for candidates and recruiters. It features multi-dimensional AI resume scoring, an online coding assessment judge with Docker container sandboxing, AI mock voice & code interviews, interactive skill progress analytics, and an AI career coach.

---

## 🌟 Key Platform Features

### 🤖 Multi-Dimensional AI Resume Score Engine
- **10-Category Deterministic Base Engine (0-100 pts)**: Evaluates ATS Compatibility (15), Contact Info (5), Summary (10), Skills (15), Work Experience (20), Projects (15), Education (5), Achievements (5), Keywords/Job Relevance (5), and Formatting (5).
- **Anti-Gaming Credibility Check**: Penalizes skill-stuffing if candidate lists 15+ skills without proof of use in experience or project descriptions.
- **Groq AI Qualitative Layer**: Secondary `llama-3.3-70b-versatile` qualitative review returning a strictly bounded score adjustment ($\in [-5, +5]$).
- **Priority Recommendations**: Generates category explanations, top strengths, areas for improvement, and missing high-value keywords.

### 💻 Online Coding Assessment & Docker Judge Sandbox
- **20+ Structured DSA Topics**: Array & Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Graphs, Heap & Priority Queue, Dynamic Programming, Greedy, Backtracking, Tries, Intervals, Bit Manipulation, Math & Geometry, Advanced Graphs, System Design, SQL & Database, Object-Oriented Design.
- **Monaco Code Editor Integration**: Full `@monaco-editor/react` environment supporting Python 3, Java 17, C++, and JavaScript with custom themes, auto-completion, and keyboard shortcuts.
- **Secure Docker Judge Sandbox**: Ephemeral Docker container isolation running as non-root user `sandboxuser` with strict RAM ($128\text{ MB}$) and CPU time ($3000\text{ ms}$) caps. Fallback to lightweight local process execution on serverless platforms.
- **Integrated 11-Mode Groq AI Copilot**: Real-time AI code reviews, $O(N)$ time & space complexity analysis, bug fixes, progressive hints, and alternative solutions built directly into the problem UI workspace.

### 🎤 Voice & Code AI Mock Interview Platform
- **Speech & Audio Engine**: Web Speech API Speech-to-Text (STT) for continuous voice input with confidence scoring, Text-to-Speech (TTS) question playback, and AudioContext Voice Activity Detection (VAD) visualizer.
- **Live Interview Room & 9-Parameter AI Evaluation**: Real-time timers, auto-save state, reconnect support, and multi-parameter score breakdown (Correctness, Technical Knowledge, Communication, Problem Solving, Clean Code, etc.).

### 🎯 Candidate Learning, Skill Progress & AI Career Coach
- **Sequential DSA Roadmap**: 20 DSA topic cards tracking attempted vs solved counts, accuracy %, and difficulty breakdowns.
- **AI Career Coach**: 6 readiness scores paired with 9 interactive AI action buttons (Resume Optimizer, Market Readiness, Elevator Pitch, Interview Drill, Salary Negotiator, Skill Roadmap).

---

## 🏗️ Tech Stack

- **Framework**: Next.js 16.2.10 (App Router, Server Actions, Turbopack)
- **Runtime & UI**: React 19, Tailwind CSS v4, Radix UI Primitives, Framer Motion 12, Lucide Icons, Sonner Toasts
- **Database & ORM**: PostgreSQL, Prisma 7 (`@prisma/adapter-pg`)
- **Authentication**: Auth.js v5 (`next-auth@5.0.0-beta.31`) with Credentials, Google, & GitHub OAuth
- **LLM Engine**: Groq SDK (`groq-sdk`) with `llama-3.3-70b-versatile`
- **Code Execution Sandbox**: Docker Container Sandbox (`python:3.10-slim`, `openjdk:17-slim`, `gcc:12`) & Node.js Process Sandbox fallback
- **Code Editor**: Monaco Code Editor (`@monaco-editor/react`)

---

## ⚙️ Environment Variables Setup

Copy `.env.example` to `.env.local` and set variable values:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/careerhub?schema=public"

# Auth.js v5 Configuration
AUTH_SECRET="your-generated-random-auth-secret"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Service (Groq API Key)
GROQ_API_KEY="gsk_your_groq_api_key_here"

# Cloudinary Media Storage (Optional for PDF Uploads & Avatars)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# OAuth Providers (Optional)
AUTH_GOOGLE_ID="your_google_client_id"
AUTH_GOOGLE_SECRET="your_google_client_secret"
AUTH_GITHUB_ID="your_github_client_id"
AUTH_GITHUB_SECRET="your_github_client_secret"
```

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Migration & Prisma Generation
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Production DSA Problems (Optional)
```bash
node scripts/seed-production-dsa.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Build Verification

| Command | Action |
|---|---|
| `node scripts/test-resume-scoring.js` | Runs 22-scenario automated resume scoring test suite |
| `npm run lint` | Performs ESLint code analysis |
| `npm run build` | Builds optimized production Next.js package with Turbopack |
| `npm run start` | Launches production server |

---

## 🐳 Docker Judge Execution Setup (Optional for Docker Sandbox)

To enable containerized execution for Python, Java, and C++ candidate code submissions:

```bash
docker pull python:3.10-slim
docker pull openjdk:17-slim
docker pull gcc:12
```

---

## 📄 License

This project is licensed under the MIT License.
