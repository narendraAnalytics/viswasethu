import { getOrCreateUser } from '@/lib/auth'
import { db } from '@/db'
import { sessions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'

const LANG_LABELS: Record<string, string> = {
  te: 'Telugu', hi: 'Hindi', ta: 'Tamil', kn: 'Kannada', mr: 'Marathi',
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

  const lang = LANG_LABELS[session.nativeLanguage] ?? session.nativeLanguage
  const job = JOB_LABELS[session.jobType] ?? session.jobType
  const dest = COUNTRY_LABELS[session.country] ?? { label: session.country, flag: '🌍', lang: 'the local language' }

  return (
    <div style={{ maxWidth: 720, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎓</div>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#1C2B1A', marginBottom: 8 }}>
        Your Learning Session is Ready!
      </h1>
      <p style={{ color: '#5A4A2A', fontSize: 15, marginBottom: 32 }}>
        Sethu has handed you over to your <strong style={{ color: '#D97706' }}>{dest.lang}</strong> language expert.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
        <InfoChip icon="🗣️" label="Language" value={lang} color="#D97706" />
        <InfoChip icon="💼" label="Job" value={job} color="#059669" />
        <InfoChip icon={dest.flag} label="Destination" value={dest.label} color="#EA580C" />
        <InfoChip icon="📚" label="Learning" value={dest.lang} color="#7C3AED" />
      </div>

      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(217,119,6,0.18)', padding: '32px 24px', boxShadow: '0 4px 32px rgba(217,119,6,0.08)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1C2B1A', marginBottom: 8 }}>
          AI Tutor Coming Soon
        </div>
        <div style={{ fontSize: 14, color: '#5A4A2A', lineHeight: 1.7 }}>
          Your personalised <strong>{dest.lang}</strong> learning session for <strong>{job.replace(/^.*? /, '')}</strong> workers heading to <strong>{dest.label}</strong> is being built.
          <br />The multi-agent AI tutor will start your voice lesson here very soon.
        </div>
      </div>

      <a
        href="/dashboard"
        style={{ display: 'inline-block', marginTop: 28, padding: '11px 28px', borderRadius: 24, background: '#D97706', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
      >
        ← Back to Dashboard
      </a>
    </div>
  )
}

function InfoChip({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${color}30`, borderRadius: 14, padding: '12px 18px', minWidth: 120, boxShadow: `0 2px 12px ${color}10` }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 11, color: '#5A4A2A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
    </div>
  )
}
