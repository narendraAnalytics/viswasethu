import { getOrCreateUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { sessions, sessionReports } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

const LANG_LABELS: Record<string, string> = {
  te: 'Telugu', hi: 'Hindi', ta: 'Tamil', kn: 'Kannada', mr: 'Marathi',
}
const COUNTRY_FLAGS: Record<string, string> = {
  dubai: '🇦🇪', japan: '🇯🇵', uk: '🇬🇧', usa: '🇺🇸', russia: '🇷🇺', china: '🇨🇳',
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

type Report = {
  fluencyPoints?: number
  vocabularyLearned?: string[]
  stuckWords?: string[]
  readinessLevel?: string
  summary?: string
}

const READINESS_COLOR: Record<string, string> = {
  beginner: '#EA580C',
  basic: '#D97706',
  ready: '#059669',
}

export default async function ReportsPage() {
  try {
    const user = await getOrCreateUser()

    const rows = await db
      .select({
        reportId: sessionReports.id,
        report: sessionReports.report,
        createdAt: sessionReports.createdAt,
        sessionId: sessions.id,
        nativeLanguage: sessions.nativeLanguage,
        jobType: sessions.jobType,
        country: sessions.country,
        startedAt: sessions.startedAt,
        endedAt: sessions.endedAt,
      })
      .from(sessionReports)
      .innerJoin(sessions, eq(sessionReports.sessionId, sessions.id))
      .where(eq(sessions.userId, user.id))
      .orderBy(desc(sessionReports.createdAt))

    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.4rem,3vw,2rem)', color: '#1C2B1A', margin: '0 0 6px' }}>
              📊 Session Reports
            </h1>
            <p style={{ color: '#5A4A2A', fontSize: 14, margin: 0 }}>
              {rows.length} report{rows.length !== 1 ? 's' : ''} generated
            </p>
          </div>
          <Link
            href="/dashboard"
            style={{ padding: '10px 22px', borderRadius: 24, background: 'linear-gradient(135deg,#D97706,#EA580C)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}
          >
            + New Session
          </Link>
        </div>

        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, border: '1px solid rgba(217,119,6,0.15)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1C2B1A', marginBottom: 8 }}>No reports yet</div>
            <div style={{ fontSize: 14, color: '#5A4A2A', marginBottom: 24 }}>Complete a session to generate your first report</div>
            <Link href="/dashboard" style={{ padding: '12px 32px', borderRadius: 50, background: 'linear-gradient(135deg,#D97706,#EA580C)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              🎤 Start Learning
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {rows.map(row => {
              const rep = row.report as Report
              const date = new Date(row.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              const duration = row.endedAt
                ? Math.round((new Date(row.endedAt).getTime() - new Date(row.startedAt).getTime()) / 60000)
                : null
              const readiness = rep.readinessLevel ?? 'beginner'
              const readinessColor = READINESS_COLOR[readiness] ?? '#D97706'

              return (
                <div key={row.reportId} style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(217,119,6,0.15)', boxShadow: '0 4px 24px rgba(217,119,6,0.07)', overflow: 'hidden' }}>
                  {/* Card header */}
                  <div style={{ background: 'linear-gradient(135deg,#FFF8ED,#FFF3E0)', borderBottom: '1px solid rgba(217,119,6,0.12)', padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1C2B1A' }}>
                        {COUNTRY_FLAGS[row.country] ?? '🌍'} {cap(row.country)} · {cap(row.jobType)}
                      </div>
                      <div style={{ fontSize: 12, color: '#5A4A2A', marginTop: 2 }}>
                        {LANG_LABELS[row.nativeLanguage] ?? row.nativeLanguage} · {date}
                        {duration !== null && ` · ${duration} min`}
                      </div>
                    </div>
                    <div style={{ padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${readinessColor}18`, color: readinessColor }}>
                      {cap(readiness)}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid rgba(217,119,6,0.08)' }}>
                    <StatCell label="Fluency Score" value={`${rep.fluencyPoints ?? 0}/100`} color="#D97706" />
                    <StatCell label="Words Learned" value={String(rep.vocabularyLearned?.length ?? 0)} color="#059669" />
                    <StatCell label="Stuck Words" value={String(rep.stuckWords?.length ?? 0)} color="#EA580C" />
                  </div>

                  {/* Summary */}
                  {rep.summary && (
                    <div style={{ padding: '14px 22px', fontSize: 13, color: '#1C2B1A', lineHeight: 1.6 }}>
                      {rep.summary}
                    </div>
                  )}

                  {/* Word lists */}
                  {(rep.vocabularyLearned?.length ?? 0) > 0 && (
                    <div style={{ padding: '0 22px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <WordList label="✅ Words Learned" words={rep.vocabularyLearned ?? []} color="#059669" bg="#F0FDF4" />
                      {(rep.stuckWords?.length ?? 0) > 0 && (
                        <WordList label="⚠️ Needs Practice" words={rep.stuckWords ?? []} color="#EA580C" bg="#FFF7ED" />
                      )}
                    </div>
                  )}
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

function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#5A4A2A', fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  )
}

function WordList({ label, words, color, bg }: { label: string; words: string[]; color: string; bg: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {words.map((w, i) => (
          <span key={i} style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: bg, color }}>{w}</span>
        ))}
      </div>
    </div>
  )
}
