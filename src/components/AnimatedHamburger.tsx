'use client'

import { useEffect, useRef } from 'react'

interface AnimatedHamburgerProps {
  isOpen: boolean
  onClick: () => void
  className?: string
  ariaControls?: string
}

export default function AnimatedHamburger({ isOpen, onClick, className = '', ariaControls }: AnimatedHamburgerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Add keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (document.activeElement === buttonRef.current) {
          e.preventDefault()
          onClick()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClick])

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      {...(ariaControls && { 'aria-controls': ariaControls })}
      {...{ 'aria-expanded': isOpen ? 'true' : 'false' }}
      className={`hamburger-button relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 overflow-hidden ${className}`}
    >
      {/* Holographic background with rainbow gradient */}
      <div className="absolute inset-0 holographic-bg" />

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20" />

      {/* Hamburger lines container */}
      <div className="relative w-6 h-5 flex flex-col justify-between z-10">
        {/* Top line */}
        <span
          className={`hamburger-line ${isOpen ? 'top-line-open' : ''}`}
          style={{
            transformOrigin: 'center',
          }}
        />

        {/* Middle line */}
        <span
          className={`hamburger-line ${isOpen ? 'middle-line-open' : ''}`}
          style={{
            transformOrigin: 'center',
          }}
        />

        {/* Bottom line */}
        <span
          className={`hamburger-line ${isOpen ? 'bottom-line-open' : ''}`}
          style={{
            transformOrigin: 'center',
          }}
        />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Hamburger button 3D perspective */
        .hamburger-button {
          perspective: 1000px;
        }

        /* Holographic rainbow gradient background */
        .holographic-bg {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 14%,
            #f093fb 28%,
            #4facfe 42%,
            #00f2fe 56%,
            #43e97b 70%,
            #667eea 84%,
            #764ba2 100%
          );
          background-size: 400% 400%;
          animation: rainbow-shift 8s ease infinite;
          border-radius: 1rem;
        }

        @keyframes rainbow-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Hamburger line base styles */
        .hamburger-line {
          display: block;
          width: 100%;
          height: 2.5px;
          background: white;
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Top line transformation */
        .top-line-open {
          transform: translateY(9px) rotateZ(45deg) scale(1.1);
        }

        /* Middle line transformation */
        .middle-line-open {
          transform: scaleX(0) rotateZ(180deg);
          opacity: 0;
        }

        /* Bottom line transformation */
        .bottom-line-open {
          transform: translateY(-9px) rotateZ(-45deg) scale(1.1);
        }

        /* 3D hover effect */
        button:hover .holographic-bg {
          animation-duration: 4s;
        }

        button:active {
          transform: scale(0.95) rotateY(5deg);
        }
      `}} />
    </button>
  )
}
