'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useAuth } from '@clerk/nextjs'
import { getPlanFromHas, PLAN_BADGE } from '@/lib/plans'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/reports', label: 'Reports' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { has } = useAuth()
  const badge = PLAN_BADGE[getPlanFromHas(has)]

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 64,
        background: 'rgba(255, 248, 237, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(217, 119, 6, 0.18)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: 8,
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 32 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #D97706, #EA580C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 18 }}>🌉</span>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 15, color: '#1C2B1A', lineHeight: 1.1 }}>
            ViswaSethu
          </div>
          <div style={{ fontSize: 10, color: '#D97706', fontWeight: 600, letterSpacing: '0.06em' }}>
            BRIDGE OF TRUST
          </div>
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: '6px 16px',
                borderRadius: 24,
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? '#D97706' : '#5A4A2A',
                background: active ? 'rgba(217, 119, 6, 0.10)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Right: plan badge (plus/pro only) + UserButton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          color: badge.color, background: badge.bg,
          padding: '4px 12px', borderRadius: 20,
          border: badge.label === 'FREE' ? '1px solid rgba(5,150,105,0.25)' : 'none',
          boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
        }}>
          {badge.label === 'FREE' ? 'Free Plan' : badge.label}
        </div>
        <UserButton />
      </div>
    </nav>
  )
}
