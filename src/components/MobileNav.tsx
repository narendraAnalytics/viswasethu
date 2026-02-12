'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import AnimatedHamburger from './AnimatedHamburger'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Home', href: '#hero', isExternal: false },
  { label: 'Features', href: '#features', isExternal: false },
  { label: 'About', href: '#about', isExternal: false },
  { label: 'Dashboard', href: '/dashboard', isExternal: true },
]

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close menu on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Handle smooth scroll for anchor links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isExternal: boolean) => {
    if (!isExternal && href.startsWith('#')) {
      e.preventDefault()
      onClose()

      setTimeout(() => {
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300) // Wait for menu close animation
    } else if (isExternal) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 mobile-nav-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile navigation panel */}
      <div id="mobile-navigation" className="fixed top-0 right-0 h-full w-full max-w-sm bg-gradient-to-br from-white via-indigo-50/30 to-emerald-50/20 backdrop-blur-xl border-l border-white/20 shadow-2xl z-40 mobile-nav-panel">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100/50 border border-indigo-50 overflow-hidden">
              <img
                src="/pagelogo.png"
                alt="VishwaSetu Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-emerald-700">
                VishwaSetu
              </h2>
              <p className="text-[8px] uppercase tracking-wider text-indigo-500 font-bold">
                Navigate
              </p>
            </div>
          </div>

          {/* Close button */}
          <AnimatedHamburger isOpen={true} onClick={onClose} ariaControls="mobile-navigation" />
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col p-6 space-y-2">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href, item.isExternal)}
              className="group relative px-6 py-4 rounded-2xl text-slate-700 hover:text-indigo-700 font-bold text-lg transition-all duration-300 hover:bg-white/60 hover:shadow-lg hover:scale-105 active:scale-95 mobile-nav-item overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

              {/* Icon and text */}
              <div className="relative flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 group-hover:scale-150 transition-transform duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  {item.label}
                </span>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </Link>
          ))}
        </nav>

        {/* Footer tagline */}
        <div className="absolute bottom-8 left-0 right-0 px-6 text-center">
          <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase">
            Bridge to the World
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Backdrop fade-in animation */
        .mobile-nav-backdrop {
          animation: backdrop-fade-in 0.3s ease-out;
        }

        @keyframes backdrop-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Panel slide-in animation */
        .mobile-nav-panel {
          animation: slide-in-right 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Navigation items stagger animation */
        .mobile-nav-item {
          animation: fade-in-up 0.5s ease-out backwards;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Add hardware acceleration */
        .mobile-nav-panel,
        .mobile-nav-backdrop,
        .mobile-nav-item {
          will-change: transform, opacity;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      `}} />
    </>
  )
}
