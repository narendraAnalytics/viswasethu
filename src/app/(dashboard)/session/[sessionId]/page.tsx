import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { sessions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import VoiceLearningSession from '@/components/session/VoiceLearningSession'
import { PLAN_LIMITS } from '@/lib/plans'
import type { PlanSlug } from '@/lib/plans'

const LANG_LABELS: Record<string, string> = {
  te: 'Telugu', hi: 'Hindi', ta: 'Tamil', kn: 'Kannada', mr: 'Marathi',
}
const AGENT_LABELS: Record<string, string> = {
  te: 'Telugu AI Tutor', hi: 'Hindi AI Tutor', ta: 'Tamil AI Tutor',
  kn: 'Kannada AI Tutor', mr: 'Marathi AI Tutor',
}
const JOB_LABELS: Record<string, string> = {
  driver: '🚗 Driver', plumber: '🔧 Plumber', construction: '🏗️ Construction',
  cleaner: '🧹 Cleaner', painter: '🎨 Painter',
}
const COUNTRY_LABELS: Record<string, { label: string; flag: string; lang: string }> = {
  dubai: { label: 'Dubai', flag: '🇦🇪', lang: 'Arabic' },
  japan: { label: 'Japan', flag: '🇯🇵', lang: 'Japanese' },
  uk: { label: 'UK', flag: '🇬🇧', lang: 'English' },
  usa: { label: 'USA', flag: '🇺🇸', lang: 'English' },
  russia: { label: 'Russia', flag: '🇷🇺', lang: 'Russian' },
  china: { label: 'China', flag: '🇨🇳', lang: 'Mandarin' },
}

export default async function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const user = await getOrCreateUser()

  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, user.id)))

  if (!session) notFound()

  const totalSeconds = PLAN_LIMITS[(user.plan ?? 'free') as PlanSlug].sessionSeconds

  const lang = LANG_LABELS[session.nativeLanguage] ?? session.nativeLanguage
  const agentLabel = AGENT_LABELS[session.nativeLanguage] ?? `${lang} AI Tutor`
  const job = JOB_LABELS[session.jobType] ?? session.jobType
  const dest = COUNTRY_LABELS[session.country] ?? { label: session.country, flag: '🌍', lang: 'the local language' }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎓</div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: '#1C2B1A', margin: '0 0 8px' }}>
          Your {dest.lang} Learning Session
        </h1>
        <p style={{ color: '#78450F', fontSize: 14, margin: 0, fontWeight: 500 }}>
          {agentLabel} will teach you job-specific {dest.lang} — all by voice
        </p>
      </div>

      {/* Session context chips */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <InfoChip icon="🗣️" label="Language" value={lang} color="#D97706" />
        <InfoChip icon="💼" label="Job" value={job} color="#059669" />
        <InfoChip icon={dest.flag} label="Destination" value={dest.label} color="#EA580C" />
        <InfoChip icon="📚" label="Learning" value={dest.lang} color="#7C3AED" />
      </div>

      {/* Voice learning session */}
      <VoiceLearningSession
        sessionId={sessionId}
        nativeLanguage={session.nativeLanguage}
        jobType={session.jobType}
        country={session.country}
        targetLang={dest.lang}
        agentLabel={agentLabel}
        totalSeconds={totalSeconds}
      />

      {/* Back link */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <a
          href="/dashboard"
          style={{ fontSize: 13, color: '#D97706', fontWeight: 600, textDecoration: 'none' }}
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  )
}

function InfoChip({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${color}30`, borderRadius: 14, padding: '10px 16px', minWidth: 110, boxShadow: `0 2px 12px ${color}10`, textAlign: 'center' }}>
      <div style={{ fontSize: 20, marginBottom: 3 }}>{icon}</div>
      <div style={{ fontSize: 10, color: '#5A4A2A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
    </div>
  )
}
