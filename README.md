# JobPilot

**AI-powered job hunting assistant** — Upload your resume once, and the agent finds relevant jobs, scores them against your profile, researches companies, and prepares you for interviews.

## Overview

JobPilot eliminates the repetitive work of job hunting. Instead of manually reading dozens of job descriptions and researching each company from scratch, you:

1. **Set up your profile** — Fill in your experience, skills, and preferences (or auto-extract from your resume)
2. **Search for jobs** — Enter a title and location; the agent queries Adzuna for IT jobs
3. **Get intelligent matches** — NVIDIA NIM (Llama 3.2) scores each job 0–100 against your profile with reasoning
4. **Research companies** — One click launches a Browserbase session that browses the company's public pages and builds a structured dossier
5. **Apply with confidence** — Review match scores, missing skills, and company research before applying

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Backend | InsForge (Auth, Database, Storage, Realtime) |
| Cloud Browser | Browserbase |
| AI Browser Control | Stagehand |
| Job Discovery | Adzuna API |
| AI Model | NVIDIA NIM (meta/llama-3.2-11b-vision-instruct) |
| Analytics | PostHog |
| PDF Generation | @react-pdf/renderer |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Language | TypeScript (strict) |

## Features

### Core Features
- **Authentication** — Google & GitHub OAuth via InsForge
- **Profile Management** — Complete resume fields with tag inputs, work history, education, job preferences
- **Resume Intelligence** — Upload PDF → NVIDIA NIM extracts and auto-fills profile; generate clean PDF from profile
- **Job Discovery** — Adzuna API searches IT jobs by title/location with category filtering
- **AI Job Matching** — NVIDIA NIM scores jobs 0–100 with matched/missing skills and reasoning
- **Company Research Agent** — Browserbase + Stagehand browses company site → NIM builds dossier (overview, tech stack, culture, interview prep)
- **Dashboard** — Stats, recent activity, PostHog-powered analytics charts
- **Analytics** — Jobs found over time, match score distribution, company research activity

### Pages
```
/                  → Homepage
/login             → Auth page (Google + GitHub OAuth)
/dashboard         → Overview, recent activity, analytics
/find-jobs         → Search controls + paginated jobs list
/find-jobs/[id]    → Job details + match score + company research
/profile           → Profile form, resume upload/generation
```

## Getting Started

### Prerequisites
- Node.js 20+
- InsForge project (backend URL + anon key)
- Adzuna API credentials (app_id, app_key)
- Browserbase API credentials (project_id, api_key)
- NVIDIA NIM endpoint + API key
- PostHog project (for analytics)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd job_pilot

# Install dependencies
npm install

# Copy environment template and fill in your credentials
cp .env.example .env.local
```

### Environment Variables

```env
# InsForge
NEXT_PUBLIC_INSFORGE_URL=https://your-app.region.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key
INSFORGE_SERVICE_KEY=your-service-key

# Adzuna
ADZUNA_APP_ID=your-app-id
ADZUNA_APP_KEY=your-app-key

# Browserbase
BROWSERBASE_API_KEY=your-api-key
BROWSERBASE_PROJECT_ID=your-project-id

# NVIDIA NIM
NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NIM_API_KEY=your-nim-api-key

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build & Production

```bash
npm run build
npm start
```

## Project Structure

```
/
├── app/
│   ├── (auth)/login/           → Login page & form
│   ├── dashboard/              → Dashboard page
│   ├── profile/                → Profile page
│   ├── find-jobs/              → Find Jobs page & job details
│   └── api/
│       ├── auth/               → OAuth callback & token refresh
│       ├── agent/find          → Trigger job discovery
│       ├── agent/research      → Trigger company research
│       └── resume/             → Generate & extract resume
├── agent/
│   ├── adzuna.ts               → Adzuna API + NIM scoring
│   ├── research.ts             → Company research (Browserbase + Stagehand + NIM)
│   ├── matcher.ts              → NIM job matching logic
│   ├── extractor.ts            → NIM job description extraction
│   └── types.ts                → Agent TypeScript types
├── actions/
│   ├── auth.ts                 → OAuth sign-in/out
│   ├── profile.ts              → Profile save/update
│   └── jobs.ts                 → Job status updates
├── components/
│   ├── ui/                     → shadcn/ui components
│   ├── layout/                 → Navbar, Footer, LogoutButton
│   ├── homepage/               → Hero, HowItWorks, Features
│   ├── dashboard/              → StatsBar, RecentActivity, AnalyticsCharts
│   ├── profile/                → ProfileForm, ResumeUpload, ResumePreview
│   ├── find-jobs/              → SearchControls, JobsTable, Filters, Pagination
│   └── job-details/            → JobInfo, MatchScore, JobDescription, CompanyResearch, JobActions
├── lib/
│   ├── insforge-client.ts      → Browser InsForge client
│   ├── insforge-server.ts      → Server InsForge client
│   ├── cookie-adapter.ts       → Next.js cookies() adapter for InsForge
│   ├── browserbase.ts          → Stagehand V3 session creation
│   ├── adzuna.ts               → Adzuna API client
│   ├── job-enrichment.ts       → NIM description enrichment
│   ├── nim-client.ts           → NVIDIA NIM OpenAI-compatible client
│   ├── posthog-client.ts       → PostHog browser client
│   ├── posthog-server.ts       → PostHog server client
│   └── utils.ts                → Shared utilities
├── types/
│   └── index.ts                → Global TypeScript types
├── context/                    → Project documentation (architecture, UI tokens, etc.)
├── proxy.ts                    → Route protection + session refresh (Next.js 16)
└── middleware.ts               → (deprecated)
```

## Key Architecture Decisions

### System Boundaries
- **`app/`** — Pages & API routes only, no business logic
- **`agent/`** — All agent logic, never touches React
- **`actions/`** — Server Actions for UI mutations only
- **`components/`** — UI only, no data fetching or DB calls
- **`lib/`** — Third-party client initialization & shared utilities

### Data Flow
- **UI Mutations** → Server Actions → InsForge DB → Revalidate
- **Agent Operations** → API Routes → Agent Code → External APIs → InsForge DB → Revalidate
- **Company Research** → API Route → Browserbase Session → NIM Synthesis → Save Dossier

### InsForge Client Pattern
Two separate instances — never mix:
```typescript
// Client (browser components)
import { createBrowserClient } from "@insforge/sdk/ssr";
export const insforge = createBrowserClient();

// Server (API routes, actions, agents)
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { createCookieAdapter } from "@/lib/cookie-adapter";

export async function createInsforgeServer() {
  const cookieAdapter = await createCookieAdapter();
  return createServerClient({ cookies: cookieAdapter });
}
```

## Database Schema (InsForge)

### `profiles`
Complete resume data: personal info, skills[], work_experience (jsonb), education (jsonb), job preferences, resume_pdf_url, is_complete

### `agent_runs`
Tracks each job search run: user_id, job_title_searched, location_searched, jobs_found, status

### `jobs`
Full job records with structured fields: title, company, salary, about_role, responsibilities[], requirements[], match_score (0–100), match_reason, matched_skills[], missing_skills[], company_research (jsonb), external_apply_url

### `agent_logs`
Structured logging for agent operations: run_id, message, level (info/success/warning/error)

### Storage
- **Bucket:** `resumes` → `resumes/{user_id}/resume.pdf`
- Access: authenticated users only, own files only

## Agent Patterns

### Job Discovery (Adzuna)
```typescript
// Searches IT jobs only (category=it-jobs)
const response = await fetch(
  `https://api.adzuna.com/v1/api/jobs/us/search/1?` +
  `app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&` +
  `what=${jobTitle}&where=${location}&results_per_page=10&category=it-jobs`
);
```

### Company Research (Browserbase + Stagehand + NIM)
Single session, sequential page visits (homepage + up to 3 sub-pages). Always returns a dossier — falls back to NIM synthesis from job description + profile if browser research fails.

### Resume Operations
- **Extract:** pdf-parse → NIM structured extraction → auto-fill form
- **Generate:** Profile data → NIM professional content → @react-pdf/renderer → upload to InsForge Storage

## Analytics (PostHog Events)

```typescript
job_search_started  // { userId, jobTitle, location }
job_found           // { userId, source, matchScore }
profile_completed   // { userId }
company_researched  // { userId, jobId, company }
```

Dashboard charts query PostHog directly for user-specific data.

## Deployment

Deploy to InsForge hosting via MCP tool:

```bash
# Using the InsForge deployment tool
insforge_create-deployment --source-directory ./job_pilot
```

Or deploy to Vercel/Netlify with the same environment variables.

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## License

Private project — all rights reserved.