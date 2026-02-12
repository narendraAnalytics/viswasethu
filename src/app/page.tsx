'use client'

import { useState } from 'react'
import Link from 'next/link'
import AnimatedHamburger from '@/components/AnimatedHamburger'
import InlineNav from '@/components/InlineNav'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-from),_var(--tw-gradient-to))] from-slate-50 via-white to-indigo-50/40 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-8 relative z-10">
        <div className="relative flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo - Left Side */}
          <Link href="/" className="flex items-center space-x-3 z-20">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100/50 border border-indigo-50 animate-logo overflow-hidden">
              <img
                src="/pagelogo.png"
                alt="VishwaSetu Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-emerald-700">
                VishwaSetu
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-bold">Bridge to the World</p>
            </div>
          </Link>

          {/* Centered Navigation Container */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center z-30">
            {/* Inline Navigation - Appears on both sides of icon */}
            <InlineNav
              isOpen={isMenuOpen}
              onItemClick={() => setIsMenuOpen(false)}
            />

            {/* Centered Holographic Icon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <AnimatedHamburger
                isOpen={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </div>
          </div>

          {/* Right Side - Empty for balance */}
          <div className="w-48 md:w-64" /> {/* Spacer to balance logo width */}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section - Placeholder */}
        <section id="hero" className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-7xl w-full mx-auto text-center">
            {/* Hero content will be added here */}
          </div>
        </section>

        {/* Features Section - Placeholder */}
        <section id="features" className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-7xl w-full mx-auto">
            {/* Features content will be added here */}
          </div>
        </section>

        {/* CTA Section - Placeholder */}
        <section id="cta" className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-7xl w-full mx-auto text-center">
            {/* CTA content will be added here */}

            {/* Temporary navigation button to dashboard */}
            <Link
              href="/dashboard"
              className="inline-flex items-center px-12 py-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 text-white rounded-full font-black text-xl hover:scale-105 shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:shadow-emerald-500/40 active:scale-95 transition-all duration-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-slate-400 text-[10px] font-black tracking-[0.4em] uppercase max-w-7xl w-full mx-auto border-t border-slate-100">
        Empowering Village Voices • Live Transactional AI
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes logo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-logo {
          animation: logo-float 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
