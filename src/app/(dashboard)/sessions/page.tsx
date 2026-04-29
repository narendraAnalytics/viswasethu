import { getOrCreateUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { sessions, sessionReports } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

const LANG_LABELS: Record<string, string> = {
  te: 'Telugu', hi: 'Hindi', ta: 'Tamil', kn: 'Kannada', mr: 'Marathi',
}
const JOB_ICONS: Record<string, string> = {
  driver: '🚗', plumber: '🔧', construction: '🏗️', cleaner: '🧹', painter: '🎨',
}
const COUNTRY_FLAGS: Record<string, string> = {
  dubai: '🇦🇪', japan: '🇯🇵', uk: '🇬🇧', usa: '🇺🇸', russia: '🇷🇺', china: '🇨🇳',
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default async function SessionsPage() {
  try {
    const user = await getOrCreateUser()

    const allSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id))
      .orderBy(desc(sessions.startedAt))

    const reports = await db
      .select({ sessionId: sessionReports.sessionId, report: sessionReports.report })
      .from(sessionReports)
      .innerJoin(sessions, eq(sessionReports.sessionId, sessions.id))
      .where(eq(sessions.userId, user.id))

    const reportMap = new Map(reports.map(r => [r.sessionId, r.report as {
      fluencyPoints?: number
      vocabularyLearned?: string[]
      readinessLevel?: string
    }]))

    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.4rem,3vw,2rem)', color: '#1C2B1A', margin: '0 0 6px' }}>
              📋 All Sessions
            </h1>
            <p style={{ color: '#5A4A2A', fontSize: 14, margin: 0 }}>
              {allSessions.length} session{allSessions.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Link
            href="/dashboard"
            style={{ padding: '10px 22px', borderRadius: 24, background: 'linear-gradient(135deg,#D97706,#EA580C)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}
          >
            + New Session
          </Link>
        </div>

        {allSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, border: '1px solid rgba(217,119,6,0.15)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌱</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1C2B1A', marginBottom: 8 }}>No sessions yet</div>
            <div style={{ fontSize: 14, color: '#5A4A2A', marginBottom: 24 }}>Start your first session to see it here</div>
            <Link href="/dashboard" style={{ padding: '12px 32px', borderRadius: 50, background: 'linear-gradient(135deg,#D97706,#EA580C)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              🎤 Start Learning
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {allSessions.map(session => {
              const report = reportMap.get(session.id)
              const isCompleted = session.status === 'completed'
              const date = new Date(session.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              const duration = session.endedAt
                ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
                : null

              return (
                <div key={session.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(217,119,6,0.15)', boxShadow: '0 2px 16px rgba(217,119,6,0.06)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {/* Job icon */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {JOB_ICONS[session.jobType] ?? '💼'}
                  </div>

                  {/* Main info */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1C2B1A', marginBottom: 3 }}>
                      {COUNTRY_FLAGS[session.country] ?? '🌍'} {cap(session.country)} · {cap(session.jobType)}
                    </div>
                    <div style={{ fontSize: 12, color: '#5A4A2A' }}>
                      {LANG_LABELS[session.nativeLanguage] ?? session.nativeLanguage} · {date}
                      {duration !== null && ` · ${duration} min`}
                    </div>
                  </div>

                  {/* Stats */}
                  {report && (
                    <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                      <Pill label="Fluency" value={`${report.fluencyPoints ?? 0}/100`} color="#D97706" />
                      <Pill label="Words" value={String(report.vocabularyLearned?.length ?? 0)} color="#059669" />
                      <Pill label="Level" value={cap(report.readinessLevel ?? 'beginner')} color="#7C3AED" />
                    </div>
                  )}

                  {/* Status badge */}
                  <div style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
                    background: isCompleted ? '#D1FAE5' : '#FEF3C7',
                    color: isCompleted ? '#065F46' : '#92400E',
                  }}>
                    {isCompleted ? '✓ Completed' : '● Active'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  } catch {
    redirect('/sign-in')
  }
}

function Pill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: '#5A4A2A', fontWeight: 600 }}>{label}</div>
    </div>
  )
}
