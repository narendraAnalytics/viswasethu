import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { sessions, users } from '@/db/schema'
import { eq, and, gte, count } from 'drizzle-orm'
import { PLAN_LIMITS } from '@/lib/plans'
import type { PlanSlug } from '@/lib/plans'

const createSchema = z.object({
  nativeLanguage: z.string().min(2).max(10),
  jobType: z.string().min(2).max(50),
  country: z.string().min(2).max(50),
})

export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser()
    const body = await req.json()
    const { nativeLanguage, jobType, country } = createSchema.parse(body)

    const plan = (user.plan ?? 'free') as PlanSlug
    const limits = PLAN_LIMITS[plan]

    if (plan === 'free') {
      const FREE_LANGS = ['hi', 'te']
      const FREE_COUNTRIES = ['dubai', 'russia']
      const FREE_JOBS = ['driver', 'construction']
      if (!FREE_LANGS.includes(nativeLanguage))
        return NextResponse.json({ error: 'language_restricted' }, { status: 403 })
      if (!FREE_COUNTRIES.includes(country))
        return NextResponse.json({ error: 'country_restricted' }, { status: 403 })
      if (!FREE_JOBS.includes(jobType))
        return NextResponse.json({ error: 'job_restricted' }, { status: 403 })
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const [{ value: monthlyUsed }] = await db
      .select({ value: count() })
      .from(sessions)
      .where(and(eq(sessions.userId, user.id), gte(sessions.startedAt, startOfMonth)))

    if (Number(monthlyUsed) >= limits.sessionsPerMonth) {
      return NextResponse.json({ error: 'session_limit' }, { status: 403 })
    }

    const [session] = await db
      .insert(sessions)
      .values({ userId: user.id, nativeLanguage, jobType, country })
      .returning()

    // Backfill user's primary language if not yet set
    if (!user.nativeLanguage) {
      await db.update(users)
        .set({ nativeLanguage })
        .where(eq(users.id, user.id))
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (err) {
    console.error('[POST /api/session]', err)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getOrCreateUser()
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('id')

    if (sessionId) {
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
      if (!session || session.userId !== user.id)
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(session)
    }

    const all = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id))
    return NextResponse.json(all)
  } catch (err) {
    console.error('[GET /api/session]', err)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}
