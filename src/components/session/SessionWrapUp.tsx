'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleGenAI, Modality } from '@google/genai'
import { AudioQueue, b64ToAudioBuffer } from '@/lib/audioQueue'
import type { SessionReport } from '@/agents/sessionReport/reportAgent'

interface Props {
  nativeLanguage: string
  jobType: string
  country: string
  report: SessionReport
  systemPrompt: string
  inputCtx: AudioContext
  outputCtx: AudioContext
}

export default function SessionWrapUp({
  report,
  systemPrompt,
  inputCtx,
  outputCtx,
}: Props) {
  const router = useRouter()
  const sessionRef = useRef<unknown>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioQueueRef = useRef<AudioQueue | null>(null)
  const aiBufferRef = useRef('')
  const intentionalCloseRef = useRef(false)
  const startedRef = useRef(false)
  const doneRef = useRef(false)

  const cleanup = useCallback(() => {
    intentionalCloseRef.current = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(sessionRef.current as any)?.close?.()
    sessionRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioQueueRef.current?.flush()
    inputCtx.close().catch(() => {})
    outputCtx.close().catch(() => {})
  }, [inputCtx, outputCtx])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    start()
    return () => cleanup()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function checkForEndTag(text: string) {
    if (doneRef.current) return
    if (text.includes('[SESSION:END]')) {
      doneRef.current = true
      setTimeout(() => {
        cleanup()
        window.location.href = '/dashboard'
      }, 1500)
    }
  }

  async function start() {
    try {
      await inputCtx.resume()
      await outputCtx.resume()
      audioQueueRef.current = new AudioQueue(outputCtx)

      const tokenRes = await fetch('/api/token', { method: 'POST' })
      const { token } = await tokenRes.json()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream

      const ai = new GoogleGenAI({ apiKey: token })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const liveSession = await (ai.live as any).connect({
        model: 'gemini-3.1-flash-live-preview',
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onmessage: (msg: any) => {
            const sc = msg.serverContent

            if (sc?.interrupted) {
              audioQueueRef.current?.flush()
              aiBufferRef.current = ''
              return
            }

            if (sc?.outputTranscription?.text?.trim()) {
              const chunk = sc.outputTranscription.text.trim()
              aiBufferRef.current += (aiBufferRef.current ? ' ' : '') + chunk
              checkForEndTag(aiBufferRef.current)
            }

            for (const part of sc?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                audioQueueRef.current?.push(
                  b64ToAudioBuffer(part.inlineData.data, outputCtx),
                )
              }
              const partText = part.text?.trim()
              if (partText && !sc?.outputTranscription?.text) {
                aiBufferRef.current += (aiBufferRef.current ? ' ' : '') + partText
                checkForEndTag(aiBufferRef.current)
              }
            }

            if (sc?.turnComplete) {
              checkForEndTag(aiBufferRef.current)
              aiBufferRef.current = ''
            }
          },
          onclose: () => {
            if (!intentionalCloseRef.current && !doneRef.current) {
              window.location.href = '/dashboard'
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onerror: (e: any) => {
            console.error('WrapUp Gemini Live error', e)
            if (!doneRef.current) window.location.href = '/dashboard'
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
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
        ;(liveSession as any).sendRealtimeInput?.({
          audio: {
            data: btoa(String.fromCharCode(...new Uint8Array(e.data))),
            mimeType: 'audio/pcm;rate=16000',
          },
        })
      }
    } catch (err) {
      console.error('WrapUp start error', err)
      window.location.href = '/dashboard'
    }
  }

  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #F0FDF4 0%, #ECFDF5 55%, #D1FAE5 100%)',
        borderRadius: 20,
        border: '1px solid rgba(5,150,105,0.20)',
        boxShadow: '0 4px 32px rgba(5,150,105,0.10)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}
    >
      {/* Trophy orb */}
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '2px solid rgba(5,150,105,0.25)', animation: 'vsOrbRing 1.6s ease-out infinite' }} />
        <div style={{ position: 'absolute', inset: -24, borderRadius: '50%', border: '1.5px solid rgba(5,150,105,0.12)', animation: 'vsOrbRing 1.6s ease-out 0.4s infinite' }} />
        <div
          style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40,
            boxShadow: '0 0 0 6px rgba(5,150,105,0.15), 0 8px 32px rgba(5,150,105,0.40)',
            animation: 'vsOrbBreathe 2s ease-in-out infinite',
          }}
        >
          🎉
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#065F46', marginBottom: 4 }}>
          Session Complete!
        </div>
        <div style={{ fontSize: 13, color: '#047857', fontWeight: 500 }}>
          Sethu is reviewing your session…
        </div>
      </div>

      {/* Report cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 340 }}>
        <ReportCard label="Fluency Score" value={`${report.fluencyPoints}/100`} color="#059669" />
        <ReportCard label="Words Learned" value={String(report.vocabularyLearned.length)} color="#D97706" />
        <ReportCard label="Readiness" value={report.readinessLevel} color="#7C3AED" />
        <ReportCard label="Stuck Words" value={String(report.stuckWords.length)} color="#EA580C" />
      </div>

      {/* Summary */}
      {report.summary && (
        <div style={{ fontSize: 12, color: '#065F46', textAlign: 'center', lineHeight: 1.6, maxWidth: 340, fontWeight: 500, padding: '8px 12px', background: 'rgba(5,150,105,0.08)', borderRadius: 10 }}>
          {report.summary}
        </div>
      )}

      {/* Live badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#047857', fontWeight: 500 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', animation: 'vsPulseDot 1.2s ease-in-out infinite' }} />
        Sethu (Male AI) · Gemini Live
      </div>

      <div style={{ fontSize: 11, color: '#065F46' }}>
        Speak clearly — Sethu is listening
      </div>
    </div>
  )
}

function ReportCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', border: `1px solid ${color}22`, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: '#5A4A2A', fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  )
}
