import { getOrCreateUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { sessions, sessionReports } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import DashboardClient from '@/components/dashboard/DashboardClient'

type Report = {
  fluencyPoints?: number
  vocabularyLearned?: string[]
  readinessLevel?: string
}

export default async function DashboardPage() {
  try {
    const user = await getOrCreateUser()

    // Count sessions that have a report (report = session was properly completed)
    const rows = await db
      .select({
        report: sessionReports.report,
        createdAt: sessionReports.createdAt,
      })
      .from(sessionReports)
      .innerJoin(sessions, eq(sessionReports.sessionId, sessions.id))
      .where(eq(sessions.userId, user.id))
      .orderBy(desc(sessionReports.createdAt))

    const totalSessions = rows.length

    const wordsLearned = rows.reduce((sum, r) => {
      const rep = r.report as Report
      return sum + (rep.vocabularyLearned?.length ?? 0)
    }, 0)

    // Avg readiness from fluency scores
    const avgFluency = totalSessions > 0
      ? Math.round(rows.reduce((sum, r) => sum + ((r.report as Report).fluencyPoints ?? 0), 0) / totalSessions)
      : 0
    const avgReadiness = avgFluency >= 70 ? 'Ready' : avgFluency >= 40 ? 'Basic' : totalSessions > 0 ? 'Beginner' : '—'

    // Day streak — consecutive days from today with at least one report
    const dayStreak = calcDayStreak(rows.map(r => new Date(r.createdAt)))

    return (
      <DashboardClient
        userName={user.name ?? user.email}
        totalSessions={totalSessions}
        wordsLearned={wordsLearned}
        avgReadiness={avgReadiness}
        dayStreak={dayStreak}
      />
    )
  } catch {
    redirect('/sign-in')
  }
}

function calcDayStreak(dates: Date[]): number {
  if (dates.length === 0) return 0
  const days = new Set(dates.map(d => d.toISOString().slice(0, 10)))
  let streak = 0
  const today = new Date()
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (days.has(d.toISOString().slice(0, 10))) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}
