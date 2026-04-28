# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> This file is the single source of truth for Claude Code working on this project.
> Read this entire file before doing anything in this codebase.

---

## Project Identity

**Name:** ViswaSethu – The Bridge of Trust
**Type:** Multi-Agent AI SaaS Platform
**Author:** Narendra Kumar (`nk-analytics`) — narendra.adp@gmail.com
**Mission:** Voice-first language learning for migrant workers — teaching job-specific foreign language communication from native Indian languages.
**Tagline:** *"Learn exactly what you need to speak on your first day of work abroad."*

### Core Problems Solved
- Language barriers preventing migrant workers from getting or keeping jobs abroad
- No job-specific communication training for professions like drivers, plumbers, and cleaners
- Safety risks caused by misunderstanding instructions in a foreign language
- Lack of affordable, accessible voice-based learning for low-literacy users

---

## Skills

### Frontend & UI
For ALL frontend/UI work — landing page, dashboard, session page, exam page, components — use the skill at:
`C:\Users\ES\.claude\skills\nextstack.skill`
`C:\Users\ES\.claude\skills\geminivoiceai.skill`

### Google ADK Agent Work
For ALL Google ADK agent work — writing agent code, building agents, adding tools, creating callbacks, defining agents — use the skill at:
`C:\Users\ES\.claude\skills\google-agents-cli-adk-code`
`C:\Users\ES\.claude\skills\google-agents-cli-workflow`
`C:\Users\ES\.claude\skills\google-agents-cli-scaffold`
`C:\Users\ES\.claude\skills\google-agents-cli-eval`

---

## Deployed URL
        https://viswasethu.vercel.app/

---

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Serve production build
npx tsc --noEmit     # Type check (no lint script — run npx eslint src if needed)

# Database
npm run db:push      # Push schema changes to Neon (no migration files)
npm run db:generate  # Generate migration SQL files
npm run db:studio    # Open Drizzle Studio to browse DB

# Inngest (separate terminal, once functions exist):
npx inngest-cli@latest dev
```

---

## What Is Currently Built

| Area | Status |
|---|---|
| Landing page (7 sections, Framer Motion scroll) | ✅ Done |
| Clerk auth — provider, middleware, sign-in/sign-up pages | ✅ Done |
| shadcn/ui primitives, GlobeCanvas (Three.js) | ✅ Done |
| Neon DB — `users` table, Drizzle schema + client, `getOrCreateUser()` | ✅ Done |
| Minimal `/dashboard` page (Server Component, triggers user sync) | ✅ Done |
| Agents, Tools directories | ⏳ Not yet created |
| Session, reports pages | ⏳ Not yet created |
| API routes (agents, voice, session, inngest) | ⏳ Not yet created |
| Inngest functions | ⏳ Not yet created |

> **Next.js version:** package.json uses `16.2.4` (canary). APIs may differ from training data — check `node_modules/next/dist/docs/` before writing framework-specific code. See also `AGENTS.md`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Auth | Clerk |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| AI Model | gemini-3-flash-preview |
| Voice AI | Gemini Live API (real-time bidirectional voice) |
| Agent Orchestration | Google ADK (TypeScript) |
| Voice WebSocket | ws (Node.js WebSocket server) |
| Background Jobs | Inngest |
| Email | Resend |
| Deployment | Vercel |
| Validation | Zod |
| IDs | uuid / @paralleldrive/cuid2 |

---

## Environment Variables

All secrets live in `.env`. Never hardcode keys. Never commit `.env`.

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/        # lands on landing page after login
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/        # lands on landing page after sign-up

# Neon PostgreSQL — DIRECT URL only (no -pooler, no &channel_binding=require)
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Google Gemini & ADK
GOOGLE_API_KEY=
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_LIVE_MODEL=gemini-2.0-flash-live-001
GOOGLE_GENAI_USE=FALSE
ADK_AGENT_TIMEOUT_MS=30000

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
# INNGEST_DEV=1   ← LOCAL ONLY, never set on Vercel

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@viswasethu.app

# App
NEXT_PUBLIC_APP_URL=https://viswasethu.vercel.app/
NODE_ENV=development
```

---

## Folder Structure

```
viswasethu/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx     ← ✅ Server Component — calls getOrCreateUser()
│   │   │   ├── session/[sessionId]/   ← ⏳ not yet created
│   │   │   └── reports/               ← ⏳ not yet created
│   │   ├── api/
│   │   │   ├── agents/route.ts        ← ⏳ ADK agent endpoint
│   │   │   ├── voice/route.ts         ← ⏳ Gemini Live WebSocket handler
│   │   │   ├── session/route.ts       ← ⏳ Session CRUD
│   │   │   └── inngest/route.ts       ← ⏳ Inngest webhook (must stay public)
│   │   ├── globals.css
│   │   ├── layout.tsx                 ← ClerkProvider wraps children
│   │   └── page.tsx                   ← Renders <LandingPage />
│   ├── agents/                        ← ⏳ not yet created
│   ├── tools/                         ← ⏳ not yet created
│   ├── db/
│   │   ├── schema.ts                  ← ✅ users table (Clerk ID as text PK)
│   │   └── index.ts                   ← ✅ neon-http Drizzle client
│   ├── inngest/                       ← ⏳ not yet created
│   ├── lib/
│   │   ├── auth.ts                    ← ✅ getOrCreateUser() lazy sync
│   │   └── utils.ts
│   └── components/
│       ├── ui/                        ← shadcn/ui primitives
│       ├── LandingPage.tsx            ← ✅ 7-section client component
│       └── GlobeCanvas.tsx            ← ✅ Three.js globe
├── public/
├── drizzle.config.ts                  ← ✅ points to src/db/schema.ts
├── .env                               ← secrets (never commit)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Multi-Agent Architecture

### Agent Hierarchy

```
User Input (Voice / Text)
        │
        ▼
┌─────────────────────────┐
│   Steering Manager      │  ← Detects language, intent (job + country),
│   Agent                 │    routes to sub-agents, maintains session memory
└────────────┬────────────┘
             │
     ┌───────┴────────┐
     ▼                ▼
┌─────────────┐  ┌──────────────────┐
│ NativeLingo │  │ GlobalVocation   │
│ Agents      │  │ Agents           │
│ (5 langs)   │  │ (country + job)  │
└──────┬──────┘  └────────┬─────────┘
       │                  │
       └────────┬─────────┘
                ▼
     ┌──────────────────────┐
     │  Tools & Knowledge   │
     │  - VocationalSearch  │
     │  - TechnicalDict     │
     │  - ContextCulture    │
     └──────────┬───────────┘
                ▼
     ┌──────────────────────┐
     │  Session Report      │
     │  Agent               │
     └──────────────────────┘
```

### Agents Reference

| Agent | File | Role |
|---|---|---|
| Steering Manager | `agents/steeringManager.ts` | Routes all requests, detects language & intent |
| Telugu Agent | `agents/nativeLingo/teluguAgent.ts` | Teaches in Telugu |
| Hindi Agent | `agents/nativeLingo/hindiAgent.ts` | Teaches in Hindi |
| Tamil Agent | `agents/nativeLingo/tamilAgent.ts` | Teaches in Tamil |
| Kannada Agent | `agents/nativeLingo/kannadaAgent.ts` | Teaches in Kannada |
| Marathi Agent | `agents/nativeLingo/marathiAgent.ts` | Teaches in Marathi |
| GlobalVocation Agent | `agents/globalVocation/*.ts` | Country + job-specific language training (e.g., Dubai-Driver, Japan-Construction) |
| Session Report Agent | `agents/sessionReport/reportAgent.ts` | Progress tracking and report generation |

### Tools Reference

| Tool | File | Purpose |
|---|---|---|
| VocationalSearch | `tools/vocationalSearch.ts` | Finds real job phrases and local work terms |
| TechnicalDictionary | `tools/technicalDictionary.ts` | Returns verified technical terms and safety instructions |
| ContextCulture | `tools/contextCulture.ts` | Cultural do's and don'ts for the destination country |

---

## Database Schema (Drizzle)

### ✅ Implemented — `src/db/schema.ts`

```ts
users          id (text PK = Clerk user_xxx), email, name, native_language, plan, created_at
```

**Critical rules — never deviate:**
- `users.id` is `text`, not `uuid` — Clerk IDs are strings like `user_2abc...`
- All FK columns referencing `users.id` must also be `text`
- All other PKs use `uuid().defaultRandom()`
- All FKs use `{ onDelete: 'cascade' }`
- Drizzle driver is `drizzle-orm/neon-http` — never `pg` or WebSocket driver
- DATABASE_URL must be the **direct** Neon URL: no `-pooler` in hostname, no `&channel_binding=require`

### ⏳ Still to create

- **sessions** — session ID, user ID, target language, job type, country, status, started_at, ended_at
- **session_progress** — session ID, vocabulary learned, fluency score, strengths, weak areas, readiness level
- **agent_logs** — session ID, agent name, input, output, timestamp
- **reports** — session ID, user ID, report JSON, created_at

### `getOrCreateUser()` — `src/lib/auth.ts`

Lazy sync pattern — call at the top of every protected Server Component or API route. Uses `currentUser()` (not `sessionClaims`) to reliably get email and name from Clerk. Creates the DB row on first visit; backfills missing fields on subsequent visits.

```ts
import { getOrCreateUser } from '@/lib/auth'
const user = await getOrCreateUser()  // throws if unauthenticated
```

---

## Application Workflow

1. **Onboarding** — User signs up via Clerk. Synced to Neon via Inngest lazy sync. Selects native language.
2. **Goal Setting** — User states job type (Driver, Plumber, Construction, Painter, Cleaner…) + destination country (Dubai, Japan, UK, USA, Russia, China).
3. **Steering Manager** — Detects language, identifies intent, routes to NativeLingo + GlobalVocation agents.
4. **NativeLingo Teaching** — Agent explains concepts and builds understanding in user's native language.
5. **GlobalVocation Training** — Agent delivers job-specific foreign vocab, real scenario dialogues, pronunciation. Tools are called as needed.
6. **Voice Interaction** — Gemini Live API handles real-time bidirectional voice via WebSocket. User can interrupt mid-response.
7. **Feedback Loop** — Agent provides spoken feedback, scores attempt, identifies weak areas, repeats until readiness threshold is met.
8. **Session Report** — Session Report Agent compiles: Fluency Score, Vocabulary, Strengths, Weak Areas, Readiness Level. Inngest triggers generation.
9. **Report Delivery** — Saved to Neon DB, optionally emailed via Resend.
10. **New Session** — Steering Manager prompts: new language, new country/job, or continue. Loop restarts.

### Continuous Learning Loop
Every session follows a closed feedback loop that repeats until the readiness threshold is met:

```
Practice → Get Feedback → Improve → Reinforce → Retain → Apply in Real Life
                                                                    ↓
                                              Steering Manager (next goal / new session)
```

---

## Future Scope / Roadmap

| Priority | Feature |
|---|---|
| Languages | Bengali, Odia, Punjabi, Gujarati |
| Countries | Germany (German), Qatar (Arabic), South Korea (Korean) |
| Voice | Accent correction and pronunciation scoring via audio analysis |
| Culture | Workplace etiquette, local customs, safety culture modules |
| Integrations | Job portals and overseas recruitment agencies |
| Mobile | PWA with offline support for low-connectivity users |
| AI Memory | Personalized learning paths using pgvector |
| B2B | Multi-user institutional access for training institutes |

---

## Coding Standards

- **TypeScript strict mode** — no `any`, no implicit returns, proper types everywhere
- **Server Components by default** — only use `"use client"` when genuinely needed (interactivity, hooks, browser APIs)
- **API routes** — always validate input with Zod before processing
- **Database** — always use Drizzle ORM, never raw SQL strings
- **Agents** — one file per agent, one responsibility per agent, no cross-agent direct imports (route via Steering Manager)
- **Tools** — pure functions, typed inputs and outputs, no side effects
- **Environment** — always access via `process.env.VARIABLE_NAME`, never hardcode
- **Error handling** — all async functions wrapped in try/catch, errors logged with context
- **No console.log in production** — use structured logging only

---

## Voice Integration Notes

- Gemini Live API uses **WebSocket** (not REST) — handle in `app/api/voice/route.ts`
- The main text/agent model is `GEMINI_MODEL=gemini-3-flash-preview`
- `GOOGLE_GENAI_USE=FALSE` — ADK uses the Gemini API directly, not Vertex AI
- Keep voice session state in memory per `sessionId` (not DB — too slow for real-time)
- Audio format: PCM 16-bit, 16kHz, mono for input; handle output audio chunks in streaming fashion

---

## Key Commands

```bash
# Development
npm run dev

# Inngest dev server (separate terminal)
npx inngest-cli@latest dev

# Database
npm run db:push      # apply schema to Neon instantly (dev workflow)
npm run db:generate  # generate migration SQL
npm run db:studio    # browse Neon data locally

# Type check
npx tsc --noEmit

# Lint
npx eslint src
```

---

## Do Not

- Do not use LangChain, CrewAI, or any other agent framework — ADK TypeScript only
- Do not use Vertex AI — use Gemini API directly (`GOOGLE_GENAI_USE=FALSE`)
- Do not write raw SQL — use Drizzle ORM
- Do not put business logic in components — keep components UI-only
- Do not call one agent directly from another — always route through Steering Manager
- Do not store voice session audio in the database
- Do not commit `.env`
- Do not use `sessionClaims` to read email/name — use `currentUser()` from `@clerk/nextjs/server`
- Do not add `&channel_binding=require` or `-pooler` to the Neon DATABASE_URL