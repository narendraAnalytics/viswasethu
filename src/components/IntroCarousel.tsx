'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'


const IMAGES = [
  'https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1777633106/frontendimag3_ddpoq5.png',
  'https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1777633105/frontendimage_tfapon.png',
  'https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1777633106/frontendimag2_qfztuc.png',
]

const SLIDE_DURATION = 2000   // ms per slide
const TOTAL_DURATION = SLIDE_DURATION * IMAGES.length  // 6 000 ms

export default function IntroCarousel() {
  const [visible, setVisible] = useState(false)
  const [slide, setSlide] = useState(0)
  const [progress, setProgress] = useState(0)
  const startRef = useRef<number>(0)       // when the current "run" started
  const elapsedRef = useRef<number>(0)     // total elapsed ms accumulated before pauses
  const pausedRef = useRef<boolean>(false)
  const rafRef = useRef<number>(0)

  const startTick = () => {
    startRef.current = performance.now()

    const tick = (now: number) => {
      if (pausedRef.current) return
      const elapsed = elapsedRef.current + (now - startRef.current)
      const pct = Math.min(elapsed / TOTAL_DURATION, 1)
      setProgress(pct)
      setSlide(Math.min(Math.floor(elapsed / SLIDE_DURATION), IMAGES.length - 1))
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        dismiss()
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (sessionStorage.getItem('intro_seen')) return
    setVisible(true)
    startTick()
    return () => cancelAnimationFrame(rafRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pause = () => {
    if (pausedRef.current) return
    pausedRef.current = true
    elapsedRef.current += performance.now() - startRef.current
    cancelAnimationFrame(rafRef.current)
  }

  const resume = () => {
    if (!pausedRef.current) return
    pausedRef.current = false
    startTick()
  }

  const dismiss = () => {
    sessionStorage.setItem('intro_seen', '1')
    setVisible(false)
    cancelAnimationFrame(rafRef.current)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          onMouseEnter={pause}
          onMouseLeave={resume}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Progress bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'rgba(255,255,255,0.15)',
            zIndex: 10,
          }}>
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #f0c060, #fff8e1)',
                transformOrigin: 'left',
                scaleX: progress,
              }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={dismiss}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 18,
              right: 20,
              zIndex: 11,
              background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: 38,
              height: 38,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 18,
              lineHeight: 1,
              backdropFilter: 'blur(4px)',
            }}
          >
            ✕
          </button>

          {/* Slide image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.77, 0, 0.175, 1] } }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.4 } }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMAGES[slide]}
                alt={`ViswaSethu preview ${slide + 1}`}
                style={{
                  width: '40%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Vignette */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.72) 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* Bottom gradient for text legibility */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* Wordmark */}
          <div style={{
            position: 'absolute',
            top: 24,
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 3,
            pointerEvents: 'none',
          }}>
            <span style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(15px, 3vw, 22px)',
              letterSpacing: '0.25em',
              color: 'rgba(255,255,255,0.9)',
              textTransform: 'uppercase',
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            }}>
              ViswaSethu
            </span>
          </div>

          {/* Dot indicators */}
          <div style={{
            position: 'absolute',
            bottom: 28,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 10,
            zIndex: 3,
          }}>
            {IMAGES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === slide ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i === slide ? '#f0c060' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.35s ease',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
