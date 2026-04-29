import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { sessions, sessionReports } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { generateSessionReport } from '@/agents/sessionReport/reportAgent'
import { buildWrapUpSystemPrompt } from '@/agents/steeringManager'

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

    await db.update(sessions)
      .set({ status: 'completed', endedAt: sql`now()` })
      .where(eq(sessions.id, sessionId))

    await db.insert(sessionReports)
      .values({ sessionId, report })

    const wrapUpSystemPrompt = buildWrapUpSystemPrompt(
      session.nativeLanguage,
      session.jobType,
      session.country,
      report,
    )

    return NextResponse.json({ report, wrapUpSystemPrompt })
  } catch (err) {
    console.error('[POST /api/session/[sessionId]/complete]', err)
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 })
  }
}
