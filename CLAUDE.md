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

---

## Skills

### Frontend & UI
For ALL frontend/UI work — landing page, dashboard, session page, components — use the skill at:
`C:\Users\ES\.claude\skills\nextstack.skill`
`C:\Users\ES\.claude\skills\geminivoiceai.skill`

### Google ADK Agent Work
For ALL Google ADK agent work — writing agent code, building agents, adding tools, creating callbacks — use the skill at:
`C:\Users\ES\.claude\skills\google-agents-cli-adk-code`
`C:\Users\ES\.claude\skills\google-agents-cli-workflow`

---

## Deployed URL
`https://viswasethu.vercel.app/`

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
| Landing page (8 sections, Framer Motion scroll) | ✅ Done |
| Landing page hash navigation (`/#pricing`, `/#features`, etc.) | ✅ Done |
| Clerk auth — provider, middleware, sign-in/sign-up pages | ✅ Done |
| shadcn/ui primitives, GlobeCanvas (Three.js) | ✅ Done |
| Neon DB — `users` + `sessions` + `session_reports` tables, Drizzle schema | ✅ Done |
| `/dashboard` — voice-only onboarding via Sethu (no manual buttons) | ✅ Done |
| Voice onboarding — Gemini Live, Sethu (male/Charon), detects lang+job+country | ✅ Done |
| `/api/token` — serves `GOOGLE_API_KEY` to authenticated browser clients | ✅ Done |
| `/api/session` — POST creates session + plan enforcement (language/country/job/limit gates) | ✅ Done |
| `/api/agents` — POST returns NativeLingo system prompt for the session | ✅ Done |
| `/session/[sessionId]` — live voice learning session page | ✅ Done |
| `VoiceLearningSession` component — female AI tutor (Aoede), Gemini Live, plan-aware timer | ✅ Done |
| End Session flow — transcript capture → report generation → Sethu wrap-up | ✅ Done |
| `/api/session/[sessionId]/complete` — marks session complete, generates report, plan-aware trimming | ✅ Done |
| `SessionWrapUp` component — Sethu (Charon) wrap-up voice session → hard redirect to `/dashboard` | ✅ Done |
| `agents/steeringManager.ts` — ADK LlmAgent + `buildWrapUpSystemPrompt()` | ✅ Done |
| `agents/sessionReport/reportAgent.ts` — generates JSON report via Gemini | ✅ Done |
| NativeLingo agents — Padma/Telugu, Priya/Hindi, Kavya/Tamil, Kaveri/Kannada, Gauri/Marathi | ✅ Done |
| `next.config.ts` — `serverExternalPackages` for `@google/adk` + `@google/genai` | ✅ Done |
| `/sessions` page — lists all user sessions with report stats | ✅ Done |
| `/reports` page — full session reports with vocabulary, fluency, readiness | ✅ Done |
| Dashboard stats — real data: sessions, words learned, avg readiness, day streak | ✅ Done |
| Pricing section (section 8) — Free/Plus/Pro cards, monthly/yearly toggle | ✅ Done |
| `src/lib/plans.ts` — `PLAN_LIMITS`, `PLAN_BADGE`, `getPlanFromHas()` | ✅ Done |
| Plan badge — dynamic in both Navbars (landing + dashboard) via Clerk `has()` | ✅ Done |
| Free plan enforcement — voice-level (Sethu prompt), API gates, dashboard UI | ✅ Done |
| Lazy plan sync — `getOrCreateUser()` reads Clerk `has()` and writes to `users.plan` on every request | ✅ Done |
| Plus/Pro plan timer — `totalSeconds` passed from session page via `PLAN_LIMITS[plan].sessionSeconds` | ✅ Done |
| Deployed to Vercel | ✅ Done |
| GlobalVocation agents (Dubai-Driver, Japan-Construction, etc.) | ⏳ Next |
| Tools (VocationalSearch, TechnicalDictionary, ContextCulture) | ⏳ Pending |
| Inngest background jobs | ⏳ Pending |

---

## Next Steps (Build Order)

### Step 1 — GlobalVocation Agents ← do next
Create job + country specific agents:
- `src/agents/globalVocation/dubaiDriverAgent.ts`
- `src/agents/globalVocation/japanConstructionAgent.ts`
- (etc. per job × country combination)

### Step 2 — Tools
- `src/tools/vocationalSearch.ts`
- `src/tools/technicalDictionary.ts`
- `src/tools/contextCulture.ts`

### Step 3 — Inngest Background Jobs
- `src/inngest/generateReport.ts`
- `src/app/api/inngest/route.ts`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + inline styles |
| Auth | Clerk |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM (`drizzle-orm/neon-http`) |
| AI Model (ADK agents) | `gemini-3.1-flash-lite-preview` (via `GEMINI_MODEL` env) |
| AI Model (report agent) | `gemini-3.1-flash-lite-preview` (via `GEMINI_MODEL` env) |
| Voice AI | Gemini Live API (`gemini-3.1-flash-live-preview`) |
| Agent Orchestration | Google ADK TypeScript (`@google/adk`) |
| Background Jobs | Inngest |
| Email | Resend |
| Deployment | Vercel |
| Validation | Zod |

---

## Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Neon PostgreSQL — DIRECT URL only (no -pooler, no &channel_binding=require)
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Google Gemini & ADK
GOOGLE_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite-preview
GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
GOOGLE_GENAI_USE_VERTEXAI=FALSE
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

## Multi-Agent Architecture

### Three-Phase Voice Flow

**Phase 1 — Onboarding** (`/dashboard`, `DashboardClient.tsx`):
- Agent: `steering_manager` | Voice: Male · **Charon**
- Sethu speaks to the user and detects 3 things via tag output: `[LANG:te]`, `[JOB:driver]`, `[COUNTRY:dubai]`
- On completion → `POST /api/session` → creates DB row → redirects to `/session/[sessionId]`

**Phase 2 — Learning Session** (`/session/[sessionId]`, `VoiceLearningSession.tsx`):
- Agent: `nativelingo_[lang]` | Voice: Female · **Aoede**
- User clicks "Start Learning" → fetches system prompt from `POST /api/agents` → starts Gemini Live
- Full AI transcript is accumulated in `transcriptRef` (array of turn strings) during the session
- Timer duration comes from `totalSeconds` prop (set by session page from `PLAN_LIMITS[plan].sessionSeconds`)
- User clicks "End Session" → `stopSession()` runs (creates new AudioContexts during user gesture) → calls `POST /api/session/[sessionId]/complete`

**Phase 3 — Wrap-up** (`SessionWrapUp.tsx`):
- Agent: `steering_manager` wrap-up mode | Voice: Male · **Charon**
- System prompt generated server-side via `buildWrapUpSystemPrompt()` in `steeringManager.ts`
- Sethu congratulates the user, shares report results, asks "learn more or end?"
- Detects `[SESSION:END]` tag in output → **`window.location.href = '/dashboard'`** (hard navigation — bypasses Next.js router cache so dashboard always shows fresh `monthlyUsed` count)

### End Session API Flow
`POST /api/session/[sessionId]/complete`:
1. Verifies session belongs to authenticated user
2. Calls `generateSessionReport(transcript, session)` → `SessionReport` JSON
3. **Free plan:** trims report to `{ fluencyPoints: 0, vocabularyLearned: [], stuckWords: [], readinessLevel, summary }` only
4. **Free plan:** skips `session_reports` insert if the user already has ≥1 report this month (2nd session completes but is not saved)
5. Updates `sessions.status = 'completed'`, `sessions.endedAt = now()`
6. Inserts into `session_reports` (if allowed by plan check above)
7. Calls `buildWrapUpSystemPrompt()` server-side → returns `{ report, wrapUpSystemPrompt }`

`generateSessionReport` uses `GoogleGenAI.models.generateContent` directly (not ADK LlmAgent) — it's a one-shot text generation, not an interactive agent.

### NativeLingo Teaching Curriculum (all 5 agents follow this)
1. **Stage 1** — 4 core words only: Hello, Thank you, Yes, No
2. **Stage 2** — Complete work sentences (greetings + daily workplace phrases as full sentences, not isolated words)
3. **Stage 3** — Advanced job-specific sentences (tools, supervisor commands, safety phrases — all as complete sentences)

**Per-word interactive loop:** introduce meaning → pronounce → user repeats word → feedback → build sentence → user repeats sentence → comprehension check → mini review every 4 words.

### NativeLingo Agent Config
All 5 NativeLingo agents use:
```ts
generateContentConfig: { temperature: 0.6, maxOutputTokens: 300 }
```
This keeps voice responses short and balanced. `generateContentConfig` is a native field on `LlmAgentConfig` from `@google/adk`.

### Agent Reference

| Agent Name | File | Voice | Notes |
|---|---|---|---|
| `steering_manager` | `src/agents/steeringManager.ts` | Male · Charon | Onboarding + wrap-up; exports `buildWrapUpSystemPrompt()` |
| `nativelingo_telugu` | `src/agents/nativeLingo/teluguAgent.ts` | Female · Aoede | Persona: Padma |
| `nativelingo_hindi` | `src/agents/nativeLingo/hindiAgent.ts` | Female · Aoede | Persona: Priya |
| `nativelingo_tamil` | `src/agents/nativeLingo/tamilAgent.ts` | Female · Aoede | Persona: Kavya |
| `nativelingo_kannada` | `src/agents/nativeLingo/kannadaAgent.ts` | Female · Aoede | Persona: Kaveri |
| `nativelingo_marathi` | `src/agents/nativeLingo/marathiAgent.ts` | Female · Aoede | Persona: Gauri |
| Session Report | `src/agents/sessionReport/reportAgent.ts` | — | `generateSessionReport()` — uses `GoogleGenAI.models.generateContent`, not ADK |

**Dispatcher:** `src/agents/nativeLingo/index.ts` exports `buildNativeLingoSystemPrompt(nativeLanguage, jobType, country)` and `createNativeLingoAgent()` — always use these, never import individual agent files directly.

---

## Key Architectural Patterns

### CRITICAL: Never Import `@google/adk` in Client Components
`@google/adk` depends on `@opentelemetry` which requires Node.js `async_hooks`. Importing it in any `'use client'` file causes a build error:
```
Module not found: Can't resolve 'async_hooks'
```
**Pattern:** Generate ADK-dependent strings (system prompts, configs) server-side in API routes and return them as plain strings to the client. Example: `buildWrapUpSystemPrompt()` is called in `/api/session/[sessionId]/complete/route.ts` and the result string is returned in the JSON response — `VoiceLearningSession.tsx` never imports from `steeringManager.ts`.

### AudioContext — Chrome User Gesture Requirement
`new AudioContext()` **must** be created inside a click handler (`onClick`). All three voice components enforce this:
- `DashboardClient.tsx` → `handleStartVoice()` creates AudioContext on button click
- `VoiceLearningSession.tsx` → `startSession()` creates AudioContext on "Start Learning" click **and** pre-creates wrap-up AudioContexts (`wrapUpCtxsPreRef`) synchronously in the same click handler
- `VoiceLearningSession.tsx` → `stopSession()` uses `wrapUpCtxsPreRef.current` (pre-created) rather than `new AudioContext()` — this allows the timer to trigger `stopSession()` without a user gesture

The pre-create pattern is required because the plan-based timer fires `stopSessionRef.current()` from a `setInterval` callback, which is not a user gesture. The AudioContexts must already exist from the earlier "Start Learning" click.

Never create AudioContext in `useEffect` or outside a user gesture — Chrome will block it.

### Gemini Live Session Pattern
All voice components (`DashboardClient`, `VoiceLearningSession`, `SessionWrapUp`) use the same structure:
1. Fetch `/api/token` for the API key
2. Fetch system prompt (onboarding: hardcoded; learning: `POST /api/agents`; wrap-up: returned by complete route)
3. `ai.live.connect()` with `systemInstruction`, `inputAudioTranscription: {}`, `outputAudioTranscription: {}`
4. Send `{ text: 'begin' }` via `sendRealtimeInput` to trigger the AI's first speech turn
5. Wire mic via AudioWorklet at `/worklets/capture-processor.js`
6. Play output audio via `AudioQueue` (`src/lib/audioQueue.ts`)

### Plan System — `src/lib/plans.ts`
Single source of truth for plan config. Always import from here:
```ts
import { getPlanFromHas, PLAN_LIMITS, PLAN_BADGE } from '@/lib/plans'
import type { PlanSlug } from '@/lib/plans'  // 'free' | 'plus' | 'pro'
```

- `PLAN_LIMITS[plan]` → `{ sessionSeconds, sessionsPerMonth }`
- `PLAN_BADGE[plan]` → `{ label, bg, color }` — used in both Navbar components
- `getPlanFromHas(has)` — reads plan from Clerk session token; used inside `getOrCreateUser()` to sync plan to DB, and directly in Navbar client components via `useAuth().has`

**Lazy plan sync — `src/lib/auth.ts`:** `getOrCreateUser()` calls `getPlanFromHas(has)` on every request. If `clerkPlan !== user.plan` in DB, it updates `users.plan` immediately in the same call. Clerk is the source of truth. To upgrade a user for testing: set `publicMetadata: { "plan": "plus" }` in Clerk Dashboard → the next request automatically syncs the DB.

**Plan-aware session timer:** The session page (`src/app/(dashboard)/session/[sessionId]/page.tsx`) reads `user.plan` after the lazy sync, looks up `PLAN_LIMITS[plan].sessionSeconds`, and passes it as `totalSeconds` prop to `VoiceLearningSession`. Free = 300 s, Plus = 1200 s, Pro = 2700 s.

**Free plan restrictions (enforced at 3 layers):**
1. **Voice** — `getOnboardingPrompt(plan)` in `DashboardClient.tsx` tells Sethu to redirect users away from restricted choices
2. **API** — `POST /api/session` returns 403 with `{ error: 'language_restricted' | 'country_restricted' | 'job_restricted' | 'session_limit' }` — client catches these and shows nice UI, never raw error codes
3. **UI** — `UpgradeWall` component replaces the Start button when `monthlyUsed >= monthlyLimit`

Free plan limits: Hindi/Telugu only · Dubai/Russia only · Driver/Construction only · 2 sessions/month · first session report saved only · report trimmed to summary+readiness (no vocabulary/stuck words).

Monthly session count uses `sessions.startedAt >= first day of current month` — counts **all** created sessions regardless of completion status. A session is "used" the moment `POST /api/session` inserts it — cancelling or abandoning doesn't free a slot.

### Next.js Router Cache — Dashboard Staleness Fix
`/dashboard` has `export const dynamic = 'force-dynamic'` to prevent server-side caching. All exits from `SessionWrapUp.tsx` use `window.location.href = '/dashboard'` (hard navigation) rather than `router.push('/dashboard')`. This is required because `router.push` can serve a stale RSC payload from the Next.js client-side router cache, causing `monthlyUsed` to appear unchanged after a session completes.

### Landing Page Hash Navigation
`LandingPage.tsx` uses a Framer Motion index-based section switcher (not scroll). Hash links like `/#pricing` work because a `useEffect` on mount reads `window.location.hash` and calls `goTo(index)`. Supported hashes: `#pricing` (6), `#features` (3), `#solution` (2), `#tech` (5).

### Tag Detection
Sethu outputs structured tags that are detected client-side:
- **Onboarding** (`DashboardClient.tsx`): `[LANG:te]`, `[JOB:driver]`, `[COUNTRY:dubai]` → `checkForTags()`
- **Wrap-up** (`SessionWrapUp.tsx`): `[SESSION:END]` → triggers hard redirect to `/dashboard`

After detecting a terminal tag, always wait for `turnComplete` before acting — Sethu finishes speaking first.

### `/api/agents` Route
Takes `{ sessionId }` → looks up session in DB → calls `buildNativeLingoSystemPrompt(nativeLanguage, jobType, country)` → returns `{ systemPrompt, session }`.

### Dashboard Stats Data Source
Dashboard stats are computed from `session_reports` (not `sessions.status`). A session "counts" only if it has an associated report (i.e., the user clicked End Session and the complete flow succeeded). This avoids sessions stuck in `status='active'` from appearing in stats.

### `getOrCreateUser()` — `src/lib/auth.ts`
Call at the top of every protected Server Component or API route.

```ts
import { getOrCreateUser } from '@/lib/auth'
const user = await getOrCreateUser()  // throws if unauthenticated; also syncs plan from Clerk
```

The returned `user.plan` is always up-to-date with Clerk — no separate sync call needed.

---

## Database Schema

```ts
// src/db/schema.ts
users          id (text PK = Clerk "user_xxx"), email, name, native_language, plan, created_at
sessions       id (uuid PK), userId (text FK→users), nativeLanguage, jobType, country, status, startedAt, endedAt
session_reports id (uuid PK), sessionId (uuid FK→sessions), report (jsonb), createdAt
```

`session_reports.report` shape (typed as `SessionReport` in `reportAgent.ts`):
```ts
{
  fluencyPoints: number        // 0–100
  vocabularyLearned: string[]  // words/phrases taught
  stuckWords: string[]         // words user struggled with
  readinessLevel: 'beginner' | 'basic' | 'ready'
  summary: string              // 2–3 sentence summary
}
```

**Critical rules:**
- `users.id` is `text` — Clerk IDs are strings like `user_2abc...`, never uuid
- All FKs referencing `users.id` must also be `text`
- All other PKs use `uuid().defaultRandom()`
- All FKs use `{ onDelete: 'cascade' }`
- Drizzle driver: `drizzle-orm/neon-http` — never `pg` or WebSocket driver
- DATABASE_URL: direct Neon URL only — no `-pooler` in hostname, no `&channel_binding=require`
- After any schema change run `npm run db:push`

---

## Vercel / Next.js Config Notes

- `next.config.ts` must keep `serverExternalPackages: ['@google/adk', '@google/genai']` — ADK uses Node.js-specific APIs that break if Webpack bundles them
- Never add `export const runtime = 'edge'` to any route using ADK agents — requires full Node.js runtime
- `GOOGLE_GENAI_USE_VERTEXAI=FALSE` must be set in Vercel Dashboard
- `src/app/(dashboard)/dashboard/page.tsx` has `export const dynamic = 'force-dynamic'` — do not remove it

---

## Do Not

- Do not use LangChain, CrewAI, or any other agent framework — Google ADK TypeScript only
- Do not use Vertex AI — Gemini API directly (`GOOGLE_GENAI_USE_VERTEXAI=FALSE`)
- Do not write raw SQL — use Drizzle ORM
- Do not call one agent directly from another — route via SteeringManager / dispatcher
- Do not import individual NativeLingo agent files directly — always go through `src/agents/nativeLingo/index.ts`
- Do not import `@google/adk` or any file that imports it in a `'use client'` component — causes `async_hooks` build error
- Do not store voice session audio in the database
- Do not use `sessionClaims` to read email/name — use `currentUser()` from `@clerk/nextjs/server`
- Do not add `&channel_binding=require` or `-pooler` to the Neon DATABASE_URL
- Do not create `AudioContext` outside a click handler (or before any `await` in `stopSession`)
- Do not add `export const runtime = 'edge'` to any route that imports ADK
- Do not use `router.push('/dashboard')` in `SessionWrapUp.tsx` — use `window.location.href = '/dashboard'` to bypass the Next.js router cache and ensure fresh monthly session counts
- Do not hardcode timer seconds in `VoiceLearningSession.tsx` — always pass `totalSeconds` from the session page via `PLAN_LIMITS[plan].sessionSeconds`
