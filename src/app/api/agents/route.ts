import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { sessions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { buildNativeLingoSystemPrompt } from '@/agents/nativeLingo'

const schema = z.object({ sessionId: z.string().uuid() })

export async function POST(req: Request) {
  try {
    const user = await getOrCreateUser()
    const { sessionId } = schema.parse(await req.json())

    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, user.id)))

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    const systemPrompt = buildNativeLingoSystemPrompt(
      session.nativeLanguage,
      session.jobType,
      session.country,
    )

    return NextResponse.json({ systemPrompt, session })
  } catch (err) {
    console.error('[POST /api/agents]', err)
    return NextResponse.json({ error: 'Failed to load agent' }, { status: 500 })
  }
}
