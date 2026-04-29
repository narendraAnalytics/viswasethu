'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { GoogleGenAI, Modality } from '@google/genai'
import { AudioQueue, b64ToAudioBuffer } from '@/lib/audioQueue'
import SessionWrapUp from './SessionWrapUp'
import type { SessionReport } from '@/agents/sessionReport/reportAgent'

interface Props {
  sessionId: string
  nativeLanguage: string
  jobType: string
  country: string
  targetLang: string
  agentLabel: string
}

type Phase = 'idle' | 'connecting' | 'active' | 'error' | 'completing' | 'wrapup'

const TOTAL_SECONDS = 5 * 60

export default function VoiceLearningSession({
  sessionId, nativeLanguage, jobType, country, targetLang, agentLabel,
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [statusText, setStatusText] = useState('')
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [report, setReport] = useState<SessionReport | null>(null)
  const [wrapUpSystemPrompt, setWrapUpSystemPrompt] = useState('')
  const [wrapUpCtxs, setWrapUpCtxs] = useState<{ input: AudioContext; output: AudioContext } | null>(null)
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS)

  const audioCtxsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null)
  const sessionRef = useRef<unknown>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioQueueRef = useRef<AudioQueue | null>(null)
  const aiBufferRef = useRef('')
  const transcriptRef = useRef<string[]>([])
  const intentionalCloseRef = useRef(false)
  const startedRef = useRef(false)
  // Pre-created during startSession() (user gesture) so timer-triggered stop can use them
  const wrapUpCtxsPreRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Ref to latest stopSession to avoid stale closure in timer callback
  const stopSessionRef = useRef<() => Promise<void>>(async () => {})

  const cleanup = useCallback(() => {
    intentionalCloseRef.current = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(sessionRef.current as any)?.close?.()
    sessionRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioQueueRef.current?.flush()
    audioCtxsRef.current?.input.close().catch(() => {})
    audioCtxsRef.current?.output.close().catch(() => {})
    audioCtxsRef.current = null
    startedRef.current = false
  }, [])

  useEffect(() => () => { cleanup() }, [cleanup])

  // Cleanup pre-created wrap-up contexts on unmount if unused
  useEffect(() => () => {
    wrapUpCtxsPreRef.current?.input.close().catch(() => {})
    wrapUpCtxsPreRef.current?.output.close().catch(() => {})
    wrapUpCtxsPreRef.current = null
  }, [])

  // 5-minute countdown — starts when session becomes active
  useEffect(() => {
    if (phase !== 'active') return
    setTimeLeft(TOTAL_SECONDS)
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!)
          timerIntervalRef.current = null
          void stopSessionRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [phase])

  async function startSession() {
    if (startedRef.current) return
    startedRef.current = true
    transcriptRef.current = []

    audioCtxsRef.current = {
      input: new AudioContext({ sampleRate: 16000 }),
      output: new AudioContext({ sampleRate: 24000 }),
    }
    // Pre-create wrap-up contexts now (user gesture) so timer-triggered stop works without a gesture
    wrapUpCtxsPreRef.current = {
      input: new AudioContext({ sampleRate: 16000 }),
      output: new AudioContext({ sampleRate: 24000 }),
    }

    try {
      setPhase('connecting')
      setStatusText(`Connecting to your ${agentLabel}…`)

      await audioCtxsRef.current.input.resume()
      await audioCtxsRef.current.output.resume()
      audioQueueRef.current = new AudioQueue(audioCtxsRef.current.output)

      const [tokenRes, agentRes] = await Promise.all([
        fetch('/api/token', { method: 'POST' }),
        fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }),
      ])
      const { token } = await tokenRes.json()
      const { systemPrompt } = await agentRes.json()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const ai = new GoogleGenAI({ apiKey: token })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const liveSession = await (ai.live as any).connect({
        model: 'gemini-3.1-flash-live-preview',
        callbacks: {
          onopen: () => {
            setPhase('active')
            setStatusText(`${agentLabel} is greeting you…`)
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onmessage: (msg: any) => {
            const sc = msg.serverContent

            if (sc?.interrupted) {
              audioQueueRef.current?.flush()
              aiBufferRef.current = ''
              setAiSpeaking(false)
              setStatusText('Listening…')
              return
            }

            if (sc?.inputTranscription?.text?.trim()) {
              setStatusText(`You: "${sc.inputTranscription.text.trim()}"`)
            }

            if (sc?.outputTranscription?.text?.trim()) {
              const chunk = sc.outputTranscription.text.trim()
              aiBufferRef.current += (aiBufferRef.current ? ' ' : '') + chunk
              setStatusText(aiBufferRef.current.slice(-120))
            }

            for (const part of sc?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                setAiSpeaking(true)
                audioQueueRef.current?.push(
                  b64ToAudioBuffer(part.inlineData.data, audioCtxsRef.current!.output),
                )
              }
              const partText = part.text?.trim()
              if (partText && !sc?.outputTranscription?.text) {
                aiBufferRef.current += (aiBufferRef.current ? ' ' : '') + partText
                setStatusText(aiBufferRef.current.slice(-120))
              }
            }

            if (sc?.turnComplete) {
              // Accumulate AI turn into persistent transcript
              if (aiBufferRef.current.trim()) {
                transcriptRef.current.push(aiBufferRef.current.trim())
              }
              aiBufferRef.current = ''
              setAiSpeaking(false)
            }
          },
          onclose: () => {
            if (!intentionalCloseRef.current) {
              setPhase('error')
              setStatusText('Connection closed. Click Retry to reconnect.')
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onerror: (e: any) => {
            console.error('Gemini Live error', e)
            setPhase('error')
            setStatusText('Connection error. Click Retry.')
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
          },
          systemInstruction: { parts: [{ text: systemPrompt }] },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        } as never,
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sessionRef.current = liveSession as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(liveSession as any).sendRealtimeInput?.({ text: 'begin' })

      const outputCtx = audioCtxsRef.current.output
      await audioCtxsRef.current.input.audioWorklet.addModule('/worklets/capture-processor.js')
      const worklet = new AudioWorkletNode(audioCtxsRef.current.input, 'capture-processor')
      const source = audioCtxsRef.current.input.createMediaStreamSource(stream)
      source.connect(worklet)
      const silent = audioCtxsRef.current.input.createGain()
      silent.gain.value = 0
      worklet.connect(silent)
      silent.connect(audioCtxsRef.current.input.destination)

      worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(liveSession as any).sendRealtimeInput?.({
          audio: {
            data: btoa(String.fromCharCode(...new Uint8Array(e.data))),
            mimeType: 'audio/pcm;rate=16000',
          },
        })
      }

      void outputCtx
    } catch (err) {
      console.error(err)
      setPhase('error')
      setStatusText('Could not start. Check mic permissions and try again.')
      startedRef.current = false
    }
  }

  async function stopSession() {
    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    // Use pre-created AudioContexts (created during startSession user gesture).
    // Fallback to new ones only if button was clicked directly without prior startSession.
    const newCtxs = wrapUpCtxsPreRef.current ?? {
      input: new AudioContext({ sampleRate: 16000 }),
      output: new AudioContext({ sampleRate: 24000 }),
    }
    wrapUpCtxsPreRef.current = null

    cleanup()
    setAiSpeaking(false)
    setStatusText('')
    setPhase('completing')

    try {
      const transcript = transcriptRef.current.join(' ')
      const res = await fetch(`/api/session/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
      const data = await res.json() as { report: SessionReport; wrapUpSystemPrompt: string }
      setReport(data.report)
      setWrapUpSystemPrompt(data.wrapUpSystemPrompt ?? '')
      setWrapUpCtxs(newCtxs)
      setPhase('wrapup')
    } catch (err) {
      console.error('complete session error', err)
      // Fallback: still show wrapup with a minimal report
      setReport({
        fluencyPoints: 50,
        vocabularyLearned: [],
        stuckWords: [],
        readinessLevel: 'beginner',
        summary: 'Session completed. Well done for practicing today!',
      })
      setWrapUpCtxs(newCtxs)
      setPhase('wrapup')
    }
  }

  // Keep ref pointing to latest stopSession so timer callback never has a stale closure
  stopSessionRef.current = stopSession

  const isActive = phase === 'connecting' || phase === 'active'

  const timerColor = timeLeft > 120
    ? '#059669'
    : timeLeft > 60
    ? '#D97706'
    : timeLeft > 30
    ? '#EA580C'
    : '#DC2626'
  const timerMinutes = Math.floor(timeLeft / 60)
  const timerSeconds = timeLeft % 60
  const timerLabel = `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}`
  const circumference = 2 * Math.PI * 26

  // Wrap-up phase — hand off to SessionWrapUp
  if (phase === 'wrapup' && report && wrapUpCtxs) {
    return (
      <SessionWrapUp
        nativeLanguage={nativeLanguage}
        jobType={jobType}
        country={country}
        report={report}
        systemPrompt={wrapUpSystemPrompt}
        inputCtx={wrapUpCtxs.input}
        outputCtx={wrapUpCtxs.output}
      />
    )
  }

  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #FFFBF0 0%, #FFF6E0 55%, #FEF0C7 100%)',
        borderRadius: 20,
        border: '1px solid rgba(217,119,6,0.18)',
        boxShadow: '0 4px 32px rgba(217,119,6,0.08)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}
    >
      {/* Orb */}
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        {isActive && (
          <>
            <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '2px solid rgba(217,119,6,0.25)', animation: 'vsOrbRing 1.6s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: -24, borderRadius: '50%', border: '1.5px solid rgba(217,119,6,0.12)', animation: 'vsOrbRing 1.6s ease-out 0.4s infinite' }} />
          </>
        )}
        <div
          style={{
            width: 100, height: 100, borderRadius: '50%',
            background: phase === 'error'
              ? 'linear-gradient(135deg, #EF4444, #DC2626)'
              : phase === 'completing'
              ? 'linear-gradient(135deg, #059669, #10B981)'
              : phase === 'idle'
              ? 'linear-gradient(135deg, #FFF3E0, #FED97040)'
              : 'linear-gradient(135deg, #D97706, #EA580C)',
            border: phase === 'idle' ? '2px solid rgba(217,119,6,0.30)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40,
            boxShadow: isActive
              ? '0 0 0 6px rgba(217,119,6,0.15), 0 8px 32px rgba(217,119,6,0.40)'
              : '0 4px 20px rgba(217,119,6,0.20)',
            animation: isActive ? 'vsOrbBreathe 2s ease-in-out infinite' : 'none',
            transition: 'background 0.4s',
          }}
        >
          {phase === 'error' ? '⚠️' : phase === 'connecting' ? '⏳' : phase === 'completing' ? '⏳' : '🎙️'}
        </div>
      </div>

      {/* Wave bars when AI speaks */}
      {aiSpeaking && (
        <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 28 }}>
          {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1].map((delay, i) => (
            <div key={i} style={{ width: 3, height: 20, borderRadius: 2, background: '#D97706', animation: `vsWaveBar 0.8s ease-in-out ${delay}s infinite` }} />
          ))}
        </div>
      )}

      {/* Agent label */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#B45309', marginBottom: 4 }}>
          {phase === 'completing' ? 'Saving your session…' : agentLabel}
        </div>
        <div style={{ fontSize: 13, color: '#78450F', fontWeight: 500 }}>
          {targetLang} • {jobType} • {country}
        </div>
      </div>

      {/* Status */}
      {statusText && (
        <div style={{ fontSize: 13, color: phase === 'error' ? '#EF4444' : '#1C2B1A', textAlign: 'center', lineHeight: 1.6, maxWidth: 380, fontWeight: 500 }}>
          {statusText}
        </div>
      )}

      {phase === 'completing' && (
        <div style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>
          Generating your session report…
        </div>
      )}

      {/* Live badge */}
      {isActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#92400E', fontWeight: 500 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', animation: 'vsPulseDot 1.2s ease-in-out infinite' }} />
          Female AI Tutor · Gemini Live
        </div>
      )}

      {/* Session timer */}
      {phase === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="4" />
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke={timerColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - timeLeft / TOTAL_SECONDS)}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.6s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{
                fontSize: 13, fontWeight: 800, color: timerColor,
                fontFamily: 'monospace', letterSpacing: '-0.5px',
                animation: timeLeft <= 30 ? 'vsTimerPulse 0.8s ease-in-out infinite' : 'none',
                transition: 'color 0.6s ease',
              }}>
                {timerLabel}
              </span>
            </div>
          </div>
          <span style={{ fontSize: 9, color: timerColor, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.75, transition: 'color 0.6s ease' }}>
            {timeLeft <= 30 ? '⚠ TIME ENDING' : 'SESSION TIME'}
          </span>
        </div>
      )}

      {/* CTA buttons */}
      {phase === 'idle' && (
        <button
          onClick={startSession}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 40px', borderRadius: 50, border: 'none',
            background: 'linear-gradient(135deg, #D97706, #EA580C)',
            color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(217,119,6,0.40)',
          }}
        >
          🎤 Start Learning
        </button>
      )}

      {phase === 'error' && (
        <button
          onClick={() => { startedRef.current = false; intentionalCloseRef.current = false; startSession() }}
          style={{ padding: '9px 24px', borderRadius: 24, border: '1.5px solid rgba(217,119,6,0.40)', background: 'transparent', color: '#D97706', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Retry
        </button>
      )}

      {isActive && (
        <button
          onClick={stopSession}
          style={{ padding: '8px 20px', borderRadius: 24, border: '1px solid rgba(92,74,42,0.25)', background: 'transparent', color: '#5A4A2A', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
        >
          End Session
        </button>
      )}

      {phase === 'active' && !aiSpeaking && (
        <div style={{ fontSize: 11, color: '#92400E' }}>
          Speak clearly — your tutor is listening
        </div>
      )}
    </div>
  )
}
