'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleGenAI, Modality } from '@google/genai'
import { AudioQueue, b64ToAudioBuffer } from '@/lib/audioQueue'

// ── Constants ──────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'te', label: 'Telugu', flag: '🇮🇳', script: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', script: 'हिंदी' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳', script: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', flag: '🇮🇳', script: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'Marathi', flag: '🇮🇳', script: 'मराठी' },
]

const JOBS = [
  { code: 'driver', label: 'Driver', icon: '🚗' },
  { code: 'plumber', label: 'Plumber', icon: '🔧' },
  { code: 'construction', label: 'Construction', icon: '🏗️' },
  { code: 'cleaner', label: 'Cleaner', icon: '🧹' },
  { code: 'painter', label: 'Painter', icon: '🎨' },
]

const COUNTRIES = [
  { code: 'dubai', label: 'Dubai', flag: '🇦🇪', lang: 'Arabic' },
  { code: 'japan', label: 'Japan', flag: '🇯🇵', lang: 'Japanese' },
  { code: 'uk', label: 'UK', flag: '🇬🇧', lang: 'English' },
  { code: 'usa', label: 'USA', flag: '🇺🇸', lang: 'English' },
  { code: 'russia', label: 'Russia', flag: '🇷🇺', lang: 'Russian' },
  { code: 'china', label: 'China', flag: '🇨🇳', lang: 'Mandarin' },
]

const ONBOARDING_SYSTEM_PROMPT = `You are Sethu — a warm, friendly male voice assistant for ViswaSethu, an AI platform that helps Indian migrant workers learn job-specific language skills abroad.

IMPORTANT: Begin speaking IMMEDIATELY when the session opens.

STEP 1 — HOME LANGUAGE (speak in English):
Greet warmly: "Namaste! I'm Sethu, your personal guide at ViswaSethu — The Bridge of Trust. I'm here to help you learn exactly the words you'll need on your working days abroad. To get started, please tell me your home language — Telugu, Hindi, Tamil, Kannada, or Marathi?"
When the user responds, confirm warmly in THEIR detected language (e.g. if Telugu say "చాలా బాగుంది!"), then output EXACTLY one tag on its own line:
[LANG:te] for Telugu | [LANG:hi] for Hindi | [LANG:ta] for Tamil | [LANG:kn] for Kannada | [LANG:mr] for Marathi

STEP 2 — JOB TYPE (speak ENTIRELY in the user's detected language from now on):
Immediately switch to speaking in the user's language. Ask what type of work they will be doing abroad.
Job options: Driver, Plumber, Construction worker, Cleaner, Painter — say these naturally in the user's language.
When detected, confirm warmly in their language, then output EXACTLY one tag on its own line:
[JOB:driver] | [JOB:plumber] | [JOB:construction] | [JOB:cleaner] | [JOB:painter]

STEP 3 — DESTINATION (continue in the user's language):
Still in the user's language, ask where they are going to work.
Country options: Dubai, Japan, UK, USA, Russia, China.
When detected, confirm warmly in their language, then output EXACTLY one tag on its own line:
[COUNTRY:dubai] | [COUNTRY:japan] | [COUNTRY:uk] | [COUNTRY:usa] | [COUNTRY:russia] | [COUNTRY:china]

CLOSING MESSAGE (speak in the user's language):
After all 3 steps, give an encouraging closing message in the user's native language. Mention that you are now handing them over to the expert for the foreign language of their destination:
- Dubai → Arabic (అరబిక్ / अरबी / அரபிக் / ಅರೇಬಿಕ್ / अरबी)
- Japan → Japanese (జపనీస్ / जापानी / ஜப்பானியம் / ಜಪಾನೀಸ್ / जपानी)
- UK or USA → English (ఇంగ్లీష్ / अंग्रेज़ी / ஆங்கிலம் / ಇಂಗ್ಲಿಷ್ / इंग्रजी)
- Russia → Russian (రష్యన్ / रूसी / ரஷ்யன் / ರಷ್ಯನ್ / रशियन)
- China → Mandarin (మాండరిన్ / मंदारिन / மாண்டரின் / ಮ್ಯಾಂಡರಿನ್ / मंदारिन)

Example closing for a Telugu speaker going to Dubai:
"అద్భుతం! మేము ఇప్పుడు మీకు మా నిపుణ అరబిక్ భాషా నిపుణుడికి అప్పగిస్తున్నాము. మీ మొదటి పని దినానికి మీకు శుభకామనలు!"

Rules:
- Tags must ALWAYS be output in English format — never translate or modify the tags
- All spoken words after step 1 must be in the user's native language
- Keep responses warm, brief, and natural like a helpful friend
- If unclear at any step, ask once more gently in the appropriate language`

// ── Main Component ──────────────────────────────────────────────────────────

interface Props {
  userName: string
  totalSessions: number
}

export default function DashboardClient({ userName, totalSessions }: Props) {
  const router = useRouter()
  const [voiceStarted, setVoiceStarted] = useState(false)
  const [launching, setLaunching] = useState(false)

  // AudioContext MUST be created inside onClick — Chrome blocks it otherwise
  const audioCtxsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null)

  const greeting = getGreeting()

  function handleStartVoice() {
    audioCtxsRef.current = {
      input: new AudioContext({ sampleRate: 16000 }),
      output: new AudioContext({ sampleRate: 24000 }),
    }
    setVoiceStarted(true)
  }

  async function handleVoiceComplete(lang: string, jobType: string, dest: string) {
    setLaunching(true)
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nativeLanguage: lang, jobType, country: dest }),
    })
    const data = await res.json()
    router.push(`/session/${data.sessionId}`)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Welcome hero */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#1C2B1A', margin: 0, lineHeight: 1.2 }}>
            {greeting}, {userName.split(' ')[0]}!
          </h1>
          <span style={{ fontSize: 28 }}>🙏</span>
        </div>
        <p style={{ color: '#5A4A2A', fontSize: 15, marginTop: 6, fontWeight: 500 }}>
          Ready to learn? Talk to Sethu — your voice-first AI guide.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="🎓" label="Sessions Completed" value={totalSessions} color="#D97706" />
        <StatCard icon="📚" label="Words Learned" value={0} color="#059669" />
        <StatCard icon="⭐" label="Avg Readiness" value="—" color="#EA580C" />
        <StatCard icon="🔥" label="Day Streak" value={totalSessions > 0 ? 1 : 0} color="#7C3AED" suffix="days" />
      </div>

      {/* Main 2-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 24 }}>
        {/* Start Session card */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(217, 119, 6, 0.18)', boxShadow: '0 4px 32px rgba(217, 119, 6, 0.08)', overflow: 'hidden' }}>
          {/* Card header */}
          <div style={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFF8ED 100%)', borderBottom: '1px solid rgba(217, 119, 6, 0.15)', padding: '20px 24px' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1C2B1A' }}>🎤 Start Your Learning Session</div>
            <div style={{ fontSize: 13, color: '#5A4A2A', marginTop: 2 }}>
              Speak with Sethu — he'll learn your language, job, and destination
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            {launching ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 0', gap: 16 }}>
                <div style={{ fontSize: 48 }}>⏳</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1C2B1A' }}>Launching your session…</div>
                <div style={{ fontSize: 13, color: '#5A4A2A' }}>Setting up your personalised AI tutor</div>
              </div>
            ) : voiceStarted && audioCtxsRef.current ? (
              <VoiceOnboardingFlow
                onComplete={handleVoiceComplete}
                inputCtx={audioCtxsRef.current.input}
                outputCtx={audioCtxsRef.current.output}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '40px 20px', background: 'linear-gradient(160deg, #FFFBF0 0%, #FFF6E0 55%, #FEF0C7 100%)', borderRadius: 14, border: '1px solid rgba(217,119,6,0.12)' }}>
                {/* Decorative orb */}
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #FED97020, #FEF3C7)', border: '2px solid rgba(217,119,6,0.30)', boxShadow: '0 4px 20px rgba(217,119,6,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
                  🎙️
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#B45309', marginBottom: 8, letterSpacing: '-0.2px' }}>
                    Talk to Sethu
                  </div>
                  <div style={{ fontSize: 13, color: '#78450F', lineHeight: 1.7, maxWidth: 300 }}>
                    Sethu will greet you, detect your language, ask your job and destination — all by voice. No buttons needed.
                  </div>
                </div>
                <button
                  onClick={handleStartVoice}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 36px', borderRadius: 50,
                    border: 'none',
                    background: 'linear-gradient(135deg, #D97706, #EA580C)',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 6px 24px rgba(217, 119, 6, 0.40)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
                >
                  🎤 Talk to Sethu
                </button>
                <div style={{ fontSize: 11, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                  Powered by Gemini Live · Voice AI
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(217, 119, 6, 0.18)', boxShadow: '0 4px 32px rgba(217, 119, 6, 0.06)', overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(217, 119, 6, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1C2B1A' }}>📋 Recent Sessions</span>
              {totalSessions > 0 && <a href="/sessions" style={{ fontSize: 12, color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>View all →</a>}
            </div>
            <div style={{ padding: '16px 20px' }}>
              {totalSessions === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🌱</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1C2B1A', marginBottom: 4 }}>No sessions yet</div>
                  <div style={{ fontSize: 12, color: '#5A4A2A' }}>Start your first session using the wizard!</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #EAF6F1, #F0FDF4)', borderRadius: 16, border: '1px solid rgba(5, 150, 105, 0.20)', padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#059669', marginBottom: 6 }}>💡 Learning Tip</div>
            <div style={{ fontSize: 12, color: '#1C2B1A', lineHeight: 1.6 }}>
              Practice daily for 15 minutes. Your AI tutor adapts to your pace and teaches exactly the phrases you'll need on Day 1.
            </div>
          </div>
        </div>
      </div>

      {/* Agent Architecture mini-visual */}
      <AgentArchitectureCard />
    </div>
  )
}

// ── Voice Onboarding Flow ───────────────────────────────────────────────────

interface VoiceOnboardingProps {
  onComplete: (lang: string, job: string, country: string) => void
  inputCtx: AudioContext   // pre-created in onClick (user gesture) — Chrome requires this
  outputCtx: AudioContext
}

function VoiceOnboardingFlow({ onComplete, inputCtx, outputCtx }: VoiceOnboardingProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'detected' | 'error'>('idle')
  const [statusText, setStatusText] = useState('Connecting to Sethu…')
  const [flowStep, setFlowStep] = useState<1 | 2 | 3>(1)
  const [aiSpeaking, setAiSpeaking] = useState(false)

  const sessionRef = useRef<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']> extends Promise<infer T> ? T : never>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioQueueRef = useRef<AudioQueue | null>(null)
  const aiBufferRef = useRef('')
  const intentionalCloseRef = useRef(false)
  const detectedRef = useRef(false)
  const detectedLangRef = useRef('')
  const detectedJobRef = useRef('')
  const pendingCompleteRef = useRef<{ lang: string; job: string; country: string } | null>(null)
  const startedRef = useRef(false)

  const cleanup = useCallback(() => {
    intentionalCloseRef.current = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(sessionRef.current as any)?.close?.()
    sessionRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioQueueRef.current?.flush()
  }, [])

  // Auto-start — AudioContexts already created in parent onClick so Chrome allows audio
  // startedRef guard prevents React StrictMode double-invocation from creating two sessions
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    start()
    return () => cleanup()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function start() {
    try {
      setStatus('connecting')
      setStatusText('Connecting to Sethu…')

      // Resume contexts — they were created in parent onClick (user gesture) so Chrome allows audio
      await inputCtx.resume()
      await outputCtx.resume()
      audioQueueRef.current = new AudioQueue(outputCtx)

      // Fetch token
      const tokenRes = await fetch('/api/token', { method: 'POST' })
      const { token } = await tokenRes.json()

      // Mic stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const ai = new GoogleGenAI({ apiKey: token })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = await (ai.live as any).connect({
        model: 'gemini-3.1-flash-live-preview',
        callbacks: {
          onopen: () => {
            setStatus('listening')
            setStatusText('Sethu is greeting you…')
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onmessage: (msg: any) => {
            const sc = msg.serverContent

            // 1. interrupted — flush audio, clear buffer, bail (skill §3)
            if (sc?.interrupted) {
              audioQueueRef.current?.flush()
              aiBufferRef.current = ''
              setAiSpeaking(false)
              setStatusText('Sethu is listening…')
              return
            }

            // 2. user speech transcript
            if (sc?.inputTranscription?.text?.trim()) {
              setStatusText(`You: "${sc.inputTranscription.text.trim()}"`)
            }

            // 3. AI transcript — accumulate into ref BEFORE checking turnComplete (skill §3)
            if (sc?.outputTranscription?.text?.trim()) {
              const chunk = sc.outputTranscription.text.trim()
              aiBufferRef.current += (aiBufferRef.current ? ' ' : '') + chunk
              const display = aiBufferRef.current.replace(/\[(LANG|JOB|COUNTRY):[a-z]+\]/g, '').trim()
              if (display) setStatusText(`Sethu: ${display}`)
              checkForTags(aiBufferRef.current)
            }

            // 4. audio parts — only setAiSpeaking when audio actually arrives (skill §3)
            for (const part of sc?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                setAiSpeaking(true)
                audioQueueRef.current?.push(b64ToAudioBuffer(part.inlineData.data, outputCtx))
              }
              // fallback: part.text when no outputTranscription came (skill §3)
              const partText = part.text?.trim()
              if (partText && !sc?.outputTranscription?.text) {
                aiBufferRef.current += (aiBufferRef.current ? ' ' : '') + partText
                setStatusText(`Sethu: ${aiBufferRef.current.replace(/\[(LANG|JOB|COUNTRY):[a-z]+\]/g, '').trim()}`)
              }
            }

            // 5. turnComplete — commit LAST; capture before clearing (skill §3 ref-mutation fix)
            if (sc?.turnComplete) {
              const aiText = aiBufferRef.current.trim()
              if (aiText) {
                checkForTags(aiText)
                aiBufferRef.current = ''
              }
              setAiSpeaking(false)
              // If country was detected this turn, Sethu just finished the closing message — now safe to complete
              if (pendingCompleteRef.current) {
                const { lang, job, country } = pendingCompleteRef.current
                pendingCompleteRef.current = null
                setTimeout(() => { cleanup(); onComplete(lang, job, country) }, 1000)
              }
            }
          },
          onclose: () => {
            if (!intentionalCloseRef.current && !detectedRef.current) {
              setStatus('error')
              setStatusText('Connection closed. Try again.')
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onerror: (e: any) => {
            console.error('Gemini Live error', e)
            setStatus('error')
            setStatusText('Connection error. Try again.')
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }, // male voice
          },
          systemInstruction: { parts: [{ text: ONBOARDING_SYSTEM_PROMPT }] },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        } as any, // skill §1 — cast required, Gemini SDK types are loose
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sessionRef.current = session as any

      // Gemini Live needs an initial input turn to start speaking — system prompt alone won't trigger output
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(session as any).sendRealtimeInput?.({ text: 'begin' })

      // Wire mic to session
      await inputCtx.audioWorklet.addModule('/worklets/capture-processor.js')
      const worklet = new AudioWorkletNode(inputCtx, 'capture-processor')
      const source = inputCtx.createMediaStreamSource(stream)
      source.connect(worklet)
      const silent = inputCtx.createGain()
      silent.gain.value = 0
      worklet.connect(silent)
      silent.connect(inputCtx.destination)

      worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session as any).sendRealtimeInput?.({
          audio: {
            data: btoa(String.fromCharCode(...new Uint8Array(e.data))),
            mimeType: 'audio/pcm;rate=16000',
          },
        })
      }

    } catch (err) {
      console.error(err)
      setStatus('error')
      setStatusText('Could not start voice. Check mic permissions.')
    }
  }

  function checkForTags(text: string) {
    // Step 1: language
    if (!detectedLangRef.current) {
      const m = text.match(/\[LANG:([a-z]{2})\]/)
      if (m) {
        detectedLangRef.current = m[1]
        setFlowStep(2)
        const found = LANGUAGES.find(l => l.code === m[1])
        if (found) setStatusText(`✓ ${found.label} detected — now tell me your job`)
      }
    }
    // Step 2: job (only after lang)
    if (detectedLangRef.current && !detectedJobRef.current) {
      const m = text.match(/\[JOB:([a-z]+)\]/)
      if (m) {
        detectedJobRef.current = m[1]
        setFlowStep(3)
        const found = JOBS.find(j => j.code === m[1])
        if (found) setStatusText(`✓ ${found.label} — now tell me your destination`)
      }
    }
    // Step 3: country (only after lang + job)
    if (detectedLangRef.current && detectedJobRef.current && !detectedRef.current) {
      const m = text.match(/\[COUNTRY:([a-z]+)\]/)
      if (m) {
        detectedRef.current = true
        const country = m[1]
        const found = COUNTRIES.find(c => c.code === country)
        setStatus('detected')
        setStatusText(`✓ All set! ${found ? found.label : country} — launching your session…`)
        // Store for turnComplete — Sethu is still speaking the closing message, don't cut it off
        pendingCompleteRef.current = { lang: detectedLangRef.current, job: detectedJobRef.current, country }
      }
    }
  }

  function stop() {
    cleanup()
    detectedRef.current = false
    detectedLangRef.current = ''
    detectedJobRef.current = ''
    pendingCompleteRef.current = null
    aiBufferRef.current = ''
    setStatus('idle')
    setStatusText('Connecting to Sethu…')
    setFlowStep(1)
  }

  const isActive = status === 'connecting' || status === 'listening'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        padding: '28px 24px',
        background: 'linear-gradient(135deg, #FFF8ED, #FFF3E0)',
        borderRadius: 16,
        border: '1.5px solid rgba(217, 119, 6, 0.20)',
      }}
    >
      {/* Voice orb — pure visual indicator, not a button */}
      <div style={{ position: 'relative', width: 96, height: 96 }}>
        {/* Pulse rings when active */}
        {isActive && (
          <>
            <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '2px solid rgba(217,119,6,0.25)', animation: 'vsOrbRing 1.6s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: -24, borderRadius: '50%', border: '1.5px solid rgba(217,119,6,0.12)', animation: 'vsOrbRing 1.6s ease-out 0.4s infinite' }} />
          </>
        )}
        <div
          style={{
            width: 96, height: 96, borderRadius: '50%',
            background: status === 'detected'
              ? 'linear-gradient(135deg, #059669, #10B981)'
              : status === 'error'
              ? 'linear-gradient(135deg, #EF4444, #DC2626)'
              : 'linear-gradient(135deg, #D97706, #EA580C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
            boxShadow: isActive
              ? '0 0 0 6px rgba(217,119,6,0.15), 0 8px 32px rgba(217,119,6,0.40)'
              : '0 4px 20px rgba(217,119,6,0.30)',
            animation: isActive ? 'vsOrbBreathe 2s ease-in-out infinite' : 'none',
            transition: 'background 0.4s, box-shadow 0.4s',
          }}
        >
          {status === 'detected' ? '✓' : status === 'error' ? '⚠️' : status === 'connecting' ? '⏳' : '🎙️'}
        </div>
      </div>

      {/* Wave bars — shown when AI is speaking */}
      {aiSpeaking && (
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 28 }}>
          {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1].map((delay, i) => (
            <div key={i} style={{ width: 3, height: 20, borderRadius: 2, background: '#D97706', animation: `vsWaveBar 0.8s ease-in-out ${delay}s infinite` }} />
          ))}
        </div>
      )}

      {/* Step progress indicator */}
      {status !== 'error' && (
        <div style={{ fontSize: 11, color: '#D97706', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
          Step {flowStep} of 3 — {flowStep === 1 ? 'Your Language' : flowStep === 2 ? 'Job Type' : 'Destination'}
        </div>
      )}

      {/* Status text */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: status === 'detected' ? '#059669' : status === 'error' ? '#EF4444' : '#1C2B1A', lineHeight: 1.5 }}>
          {statusText}
        </div>
        {status === 'listening' && !aiSpeaking && (
          <div style={{ fontSize: 11, color: '#5A4A2A', marginTop: 4 }}>
            Speak clearly — Sethu is listening
          </div>
        )}
      </div>

      {/* Live badge */}
      {(isActive || status === 'detected') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#5A4A2A', fontWeight: 500 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', animation: 'vsPulseDot 1.2s ease-in-out infinite' }} />
          Sethu (Male AI) · Gemini Live
        </div>
      )}

      {/* Error retry */}
      {status === 'error' && (
        <button
          onClick={() => { detectedRef.current = false; detectedLangRef.current = ''; detectedJobRef.current = ''; pendingCompleteRef.current = null; aiBufferRef.current = ''; intentionalCloseRef.current = false; setFlowStep(1); start() }}
          style={{ fontSize: 12, color: '#D97706', background: 'transparent', border: '1px solid rgba(217,119,6,0.35)', padding: '5px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}
        >
          Retry
        </button>
      )}

      {isActive && (
        <button
          onClick={stop}
          style={{ fontSize: 12, color: '#5A4A2A', background: 'transparent', border: '1px solid rgba(92,74,42,0.25)', padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}
        >
          Cancel
        </button>
      )}
    </div>
  )
}

// ── Shared small components ─────────────────────────────────────────────────

function StatCard({ icon, label, value, color, suffix = '' }: {
  icon: string; label: string; value: number | string; color: string; suffix?: string
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: `1px solid ${color}22`, boxShadow: `0 2px 16px ${color}0F`, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>
          {value}{suffix && value !== '—' ? ` ${suffix}` : ''}
        </div>
        <div style={{ fontSize: 12, color: '#5A4A2A', fontWeight: 500, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  )
}


function AgentArchitectureCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(217, 119, 6, 0.18)', boxShadow: '0 4px 32px rgba(217, 119, 6, 0.06)', padding: '24px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1C2B1A' }}>🤖 Multi-Agent AI Architecture</div>
        <div style={{ fontSize: 12, color: '#5A4A2A', marginTop: 2 }}>Your voice goes through 3 layers of AI intelligence</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
        <AgentNode icon="🎤" label="Your Voice" sub="Telugu / Hindi / Tamil…" color="#D97706" bg="#FFF3E0" />
        <Arrow />
        <AgentNode icon="🧠" label="Steering Manager" sub="Detects language + intent" color="#7C3AED" bg="#F5F3FF" featured />
        <Arrow />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AgentNode icon="🗣️" label="NativeLingo Agent" sub="Explains in your language" color="#059669" bg="#ECFDF5" small />
          <AgentNode icon="🌍" label="GlobalVocation Agent" sub="Job + Country training" color="#EA580C" bg="#FFF7ED" small />
        </div>
        <Arrow />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AgentNode icon="🔍" label="VocationalSearch" sub="Real job phrases" color="#0891B2" bg="#ECFEFF" small />
          <AgentNode icon="📖" label="TechnicalDict" sub="Safety terms" color="#0891B2" bg="#ECFEFF" small />
        </div>
        <Arrow />
        <AgentNode icon="📊" label="Session Report" sub="Fluency score + progress" color="#D97706" bg="#FFF3E0" />
      </div>
    </div>
  )
}

function AgentNode({ icon, label, sub, color, bg, featured = false, small = false }: {
  icon: string; label: string; sub: string; color: string; bg: string; featured?: boolean; small?: boolean
}) {
  return (
    <div style={{ background: bg, border: `1.5px solid ${color}30`, borderRadius: featured ? 16 : 12, padding: small ? '8px 12px' : '12px 16px', minWidth: small ? 130 : 148, flexShrink: 0, boxShadow: featured ? `0 4px 20px ${color}20` : 'none', transform: featured ? 'scale(1.04)' : 'scale(1)' }}>
      <div style={{ fontSize: small ? 18 : 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: small ? 11 : 13, fontWeight: 700, color: '#1C2B1A', lineHeight: 1.2 }}>{label}</div>
      <div style={{ fontSize: 10, color, fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>{sub}</div>
    </div>
  )
}

function Arrow() {
  return <div style={{ padding: '0 6px', color: '#D97706', fontSize: 18, flexShrink: 0, alignSelf: 'center' }}>→</div>
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
