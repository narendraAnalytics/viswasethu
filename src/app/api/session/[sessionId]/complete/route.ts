import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { sessions, sessionReports } from '@/db/schema'
import { eq, sql, and, gte, count } from 'drizzle-orm'
import { generateSessionReport } from '@/agents/sessionReport/reportAgent'
import { buildWrapUpSystemPrompt } from '@/agents/steeringManager'
import type { PlanSlug } from '@/lib/plans'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params
    const user = await getOrCreateUser()

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await req.json().catch(() => ({})) as { transcript?: string }
    const transcript = body.transcript ?? ''

    const startedAt = session.startedAt ? new Date(session.startedAt) : new Date()
    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 60000))

    const report = await generateSessionReport(transcript, {
      nativeLanguage: session.nativeLanguage,
      jobType: session.jobType,
      country: session.country,
      durationMinutes,
    })

    const plan = (user.plan ?? 'free') as PlanSlug

    // Free plan: trim report to summary + readiness only
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let finalReport: any = report
    if (plan === 'free') {
      finalReport = {
        fluencyPoints: 0,
        vocabularyLearned: [],
        stuckWords: [],
        readinessLevel: report.readinessLevel,
        summary: report.summary,
      }
    }

    // Free plan: save report only for the first completed session this month
    let saveReport = true
    if (plan === 'free') {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const [{ value: reportsThisMonth }] = await db
        .select({ value: count() })
        .from(sessionReports)
        .innerJoin(sessions, eq(sessionReports.sessionId, sessions.id))
        .where(and(eq(sessions.userId, user.id), gte(sessionReports.createdAt, startOfMonth)))
      saveReport = Number(reportsThisMonth) < 1
    }

    await db.update(sessions)
      .set({ status: 'completed', endedAt: sql`now()` })
      .where(eq(sessions.id, sessionId))

    if (saveReport) {
      await db.insert(sessionReports)
        .values({ sessionId, report: finalReport })
    }

    const wrapUpSystemPrompt = buildWrapUpSystemPrompt(
      session.nativeLanguage,
      session.jobType,
      session.country,
      report,
    )

    return NextResponse.json({ report: finalReport, wrapUpSystemPrompt })
  } catch (err) {
    console.error('[POST /api/session/[sessionId]/complete]', err)
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 })
  }
}
