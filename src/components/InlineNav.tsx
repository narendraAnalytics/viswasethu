'use client'

import Link from 'next/link'
import { Home, Sparkles, Info, LayoutDashboard, LucideIcon } from 'lucide-react'

interface InlineNavProps {
  isOpen: boolean
  onItemClick?: () => void
}

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  color: string
  glowColor: string
}

const leftNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '#hero',
    icon: Home,
    color: '#38bdf8', // Sky Blue
    glowColor: 'rgba(56, 189, 248, 0.5)'
  },
  {
    label: 'Features',
    href: '#features',
    icon: Sparkles,
    color: '#a78bfa', // Purple
    glowColor: 'rgba(167, 139, 250, 0.5)'
  },
]

const rightNavItems: NavItem[] = [
  {
    label: 'About',
    href: '#about',
    icon: Info,
    color: '#34d399', // Emerald
    glowColor: 'rgba(52, 211, 153, 0.5)'
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: '#fb7185', // Rose
    glowColor: 'rgba(251, 113, 133, 0.5)'
  },
]

export default function InlineNav({ isOpen, onItemClick }: InlineNavProps) {
  // Handle smooth scroll for anchor links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      if (onItemClick) onItemClick()

      setTimeout(() => {
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    } else {
      if (onItemClick) onItemClick()
    }
  }

  if (!isOpen) return null

  return (
    <div className="flex items-center gap-3">
      {/* Left navigation icons */}
      <div className="flex items-center gap-2">
        {leftNavItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
            aria-label={item.label}
            className="nav-item-left group relative"
            style={{
              '--nav-color': item.color,
              '--nav-glow': item.glowColor,
              '--nav-delay': `${index * 100}ms`
            } as React.CSSProperties}
          >
            {/* Icon container with glass morphism */}
            <div className="w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl active:scale-95 nav-icon-container">
              <item.icon className="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 nav-icon" />
            </div>

            {/* Custom Colored Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 pointer-events-none z-50 tooltip-container">
              <div className="px-3 py-1.5 rounded-xl backdrop-blur-md font-bold text-sm whitespace-nowrap border-2 nav-tooltip">
                {item.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Vertical separator */}
      <div className="hidden md:block w-px h-10 bg-gradient-to-b from-transparent via-indigo-300 to-transparent nav-separator-left" />

      {/* Spacer for centered icon */}
      <div className="w-12" />

      {/* Vertical separator */}
      <div className="hidden md:block w-px h-10 bg-gradient-to-b from-transparent via-emerald-300 to-transparent nav-separator-right" />

      {/* Right navigation icons */}
      <div className="flex items-center gap-2">
        {rightNavItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleNavClick(e, item.href)}
            aria-label={item.label}
            className="nav-item-right group relative"
            style={{
              '--nav-color': item.color,
              '--nav-glow': item.glowColor,
              '--nav-delay': `${index * 100}ms`
            } as React.CSSProperties}
          >
            {/* Icon container with glass morphism */}
            <div className="w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl active:scale-95 nav-icon-container">
              <item.icon className="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12 nav-icon" />
            </div>

            {/* Custom Colored Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 pointer-events-none z-50 tooltip-container">
              <div className="px-3 py-1.5 rounded-xl backdrop-blur-md font-bold text-sm whitespace-nowrap border-2 nav-tooltip">
                {item.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* CSS Custom Properties Styles */
        .nav-icon-container {
          border-color: var(--nav-color);
          box-shadow: 0 0 20px var(--nav-glow);
        }

        .nav-icon {
          color: var(--nav-color);
          filter: drop-shadow(0 0 6px var(--nav-glow));
        }

        .nav-tooltip {
          color: var(--nav-color);
          background-color: color-mix(in srgb, var(--nav-color) 8%, transparent);
          border-color: var(--nav-color);
          box-shadow: 0 0 20px var(--nav-glow), 0 4px 12px var(--nav-glow);
        }

        /* Animation delay using CSS variable */
        .nav-item-left,
        .nav-item-right {
          animation-delay: var(--nav-delay);
        }

        /* Left items animation - slide from center to left with bounce */
        .nav-item-left {
          animation: expand-left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }

        @keyframes expand-left {
          0% {
            opacity: 0;
            transform: translateX(40px) scale(0.5) rotate(180deg);
          }
          60% {
            transform: translateX(-5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotate(0deg);
          }
        }

        /* Right items animation - slide from center to right with bounce */
        .nav-item-right {
          animation: expand-right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }

        @keyframes expand-right {
          0% {
            opacity: 0;
            transform: translateX(-40px) scale(0.5) rotate(-180deg);
          }
          60% {
            transform: translateX(5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotate(0deg);
          }
        }

        /* Separator animations with glow */
        .nav-separator-left {
          animation: expand-separator-left 0.4s ease-out backwards;
          animation-delay: 300ms;
        }

        .nav-separator-right {
          animation: expand-separator-right 0.4s ease-out backwards;
          animation-delay: 300ms;
        }

        @keyframes expand-separator-left {
          from {
            opacity: 0;
            height: 0;
            transform: translateX(15px);
          }
          to {
            opacity: 1;
            height: 2.5rem;
            transform: translateX(0);
          }
        }

        @keyframes expand-separator-right {
          from {
            opacity: 0;
            height: 0;
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            height: 2.5rem;
            transform: translateX(0);
          }
        }

        /* Enhanced hover glow effect */
        .nav-item-left:hover > div,
        .nav-item-right:hover > div {
          animation: icon-glow-pulse 1.5s ease-in-out infinite;
        }

        @keyframes icon-glow-pulse {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.2);
          }
        }

        /* Hardware acceleration */
        .nav-item-left,
        .nav-item-right {
          will-change: transform, opacity;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        /* Tooltip fade-in animation */
        .tooltip-container {
          animation: tooltip-fade-in 0.3s ease-out;
        }

        @keyframes tooltip-fade-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Tooltip visibility on hover */
        .group:hover .tooltip-container {
          animation: tooltip-fade-in 0.3s ease-out;
        }

        /* Enhanced tooltip glow on hover */
        .group:hover .tooltip-container > div {
          animation: tooltip-glow 1.5s ease-in-out infinite;
        }

        @keyframes tooltip-glow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.15);
          }
        }
      `}} />
    </div>
  )
}
