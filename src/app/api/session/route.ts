import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { sessions } from '@/db/schema'
import { eq } from 'drizzle-orm'

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

    const [session] = await db
      .insert(sessions)
      .values({ userId: user.id, nativeLanguage, jobType, country })
      .returning()

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
