"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useUser, useAuth, UserButton } from "@clerk/nextjs";
import { getPlanFromHas, PLAN_BADGE } from "@/lib/plans";

const TOTAL = 8;

// ── Typography helpers ──
const ff = {
  playfair: "var(--font-playfair), 'Playfair Display', serif",
  jakarta: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
  space: "var(--font-space), 'Space Mono', monospace",
};

const sectionVariants = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 60 : -60 }),
  active: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] as [number, number, number, number] } },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? -60 : 60,
    transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] as [number, number, number, number] },
  }),
};

// ── NAVBAR ──
function Navbar({ current: _current, goTo: _goTo }: { current: number; goTo: (i: number) => void }) {
  const { isSignedIn } = useUser();
  const { has } = useAuth();
  const badge = PLAN_BADGE[getPlanFromHas(has)];

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 900,
        padding: "18px 48px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        fontFamily: ff.jakarta,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Image
          src="/logo.png"
          alt="ViswaSethu Logo"
          width={48}
          height={48}
          style={{ objectFit: "contain", filter: "drop-shadow(0 0 6px rgba(217,119,6,0.3))" }}
        />
        <span style={{ fontFamily: ff.jakarta, fontSize: "1.25rem", fontWeight: 700, color: "#D97706", letterSpacing: "0.02em" }}>
          ViswaSethu
        </span>
      </div>

      {/* Right side: plan badge + user avatar */}
      {isSignedIn && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: badge.bg, color: badge.color,
            fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em",
            padding: "4px 12px", borderRadius: 20,
            border: badge.label === 'FREE' ? '1px solid rgba(5,150,105,0.28)' : 'none',
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          }}>
            {badge.label}
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: 38, height: 38, border: "2px solid #D97706", borderRadius: "50%" },
              },
            }}
          />
        </div>
      )}
    </nav>
  );
}

// ── DOT NAV ──
function DotNav({ current, goTo }: { current: number; goTo: (i: number) => void }) {
  const labels = ["Home", "Problem", "Solution", "Features", "Who's It For", "Tech Stack", "Pricing", "Get Started"];
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div style={{ position: "fixed", right: 28, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 14, zIndex: 1000 }}>
      {labels.map((label, i) => (
        <div key={i} style={{ position: "relative", display: "flex", alignItems: "center" }}>
          {/* Tooltip */}
          {hovered === i && (
            <div style={{
              position: "absolute", right: 22,
              background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", color: "#78450F",
              fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
              padding: "4px 10px", borderRadius: 6,
              boxShadow: "0 2px 12px rgba(217,119,6,0.25)",
              pointerEvents: "none",
              animation: "vs-tooltip-in 0.15s ease",
            }}>
              {label}
              {/* Arrow pointing right */}
              <span style={{
                position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)",
                width: 0, height: 0,
                borderTop: "5px solid transparent",
                borderBottom: "5px solid transparent",
                borderLeft: "5px solid #FDE68A",
              }} />
            </div>
          )}
          <button
            onClick={() => goTo(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: 10, height: 10, borderRadius: "50%", cursor: "pointer", padding: 0,
              background: current === i ? "#D97706" : "rgba(217,119,6,0.2)",
              border: `1.5px solid ${current === i ? "#D97706" : "rgba(217,119,6,0.5)"}`,
              boxShadow: current === i ? "0 0 12px rgba(217,119,6,0.5)" : "none",
              transform: current === i ? "scale(1.4)" : "scale(1)",
              transition: "all 0.4s ease",
            } as React.CSSProperties}
          />
        </div>
      ))}
      <style>{`@keyframes vs-tooltip-in { from { opacity:0; transform:translateX(4px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}

const HERO_IMAGES = [
  "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1777460835/bannerimage2_wpfh1c.png",
  "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1777461478/bannerimage3_somn4a.png",
  "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1777292512/bannerimage1_uodots.png",
   "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1777462223/bannerimage4_snqfbb.png",
];

const TRUST_WORDS = [
  { word: "Trust",     color: "#D97706" },  // amber
  { word: "विश्वास",   color: "#F472B6" },  // pink — Hindi
  { word: "நம்பிக்கை", color: "#34D399" },  // emerald — Tamil
  { word: "విశ్వాసం",  color: "#FBBF24" },  // golden — Telugu
  { word: "ನಂಬಿಕೆ",    color: "#A78BFA" },  // violet — Kannada
]

function TrustWord() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(prev => (prev + 1) % TRUST_WORDS.length)
        setVisible(true)
      }, 350)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const { word, color } = TRUST_WORDS[idx]
  return (
    <span style={{
      color,
      display: "inline-block",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(-8px)",
      transition: "opacity 0.35s ease, transform 0.35s ease, color 0.35s ease",
    }}>
      {word}
    </span>
  )
}

// ── S1: HERO ──
function HeroSection({ goTo }: { goTo: (i: number) => void }) {
  const pCanvasRef = useRef<HTMLCanvasElement>(null);
  const { isSignedIn, user } = useUser();
  const displayName = user?.username ?? user?.firstName ?? "there";
  const [bgIndex, setBgIndex] = useState(0);

  // Particle system
  useEffect(() => {
    const canvas = pCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 180 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.1 - Math.random() * 0.3,
      a: 0.2 + Math.random() * 0.5,
    }));

    let animId: number;
    const draw = () => {
      animId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,83,9,${p.a * 0.7})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      });
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBgIndex((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const WaveBar = ({ delay, height }: { delay: number; height: number }) => (
    <div style={{
      width: 3, height, borderRadius: 2, background: "#D97706", opacity: 0.5,
      animation: `vs-wave-bar 1.2s ease-in-out ${delay}s infinite`,
    }} />
  );

  return (
    <section style={{
      width: "100%", height: "100%", position: "relative", overflow: "hidden",
      backgroundColor: "#0D0502",
      display: "flex", alignItems: "center", justifyContent: "flex-start",
    }}>
      {/* Carousel background images */}
      {HERO_IMAGES.map((src, i) => (
        <div key={src} style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url('${src}')`,
          backgroundSize: "100% auto", backgroundPosition: "center top", backgroundRepeat: "no-repeat",
          opacity: bgIndex === i ? 1 : 0,
          transition: "opacity 1.2s ease-in-out",
        }} />
      ))}

      {/* Dark overlay for readability */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom,rgba(13,5,2,0.52) 0%,rgba(13,5,2,0.35) 55%,rgba(13,5,2,0.60) 100%)",
      }} />

      {/* Particles */}
      <canvas ref={pCanvasRef} style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        width: "100%", height: "100%",
        justifyContent: "center",
        padding: "100px 72px 60px",
        fontFamily: ff.jakarta,
      }}
        className="hero-inner"
      >
        {/* Text block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 620 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(217,119,6,0.18)", border: "1px solid rgba(217,119,6,0.50)",
            padding: "6px 16px", borderRadius: 50, width: "fit-content",
            fontFamily: ff.space, fontSize: "0.72rem", color: "#FBB84B", letterSpacing: "0.1em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", animation: "vs-pulse-dot 2s infinite", display: "inline-block" }} />
            AI-Powered Voice Platform
          </div>

          <h1 style={{
            fontFamily: ff.playfair,
            fontSize: "clamp(2.8rem, 5vw, 5rem)",
            fontWeight: 900, lineHeight: 1.08,
            color: "#FDE68A",
            textShadow: "0 0 60px rgba(245,158,11,0.35)",
            margin: 0,
          }}>
            The Bridge<br />of <TrustWord />
          </h1>

          <p style={{ fontSize: "clamp(1rem,1.5vw,1.2rem)", color: "#FDE68A", lineHeight: 1.6, maxWidth: 500, margin: 0 }}>
            AI-powered voice learning. Your language → Global opportunity. Learn exactly what you need to speak on your first day of work abroad.
          </p>

          <div style={{ display: "flex", gap: 3, height: 30, alignItems: "center", marginTop: 4 }}>
            {[{ h: 8, d: 0 }, { h: 18, d: 0.1 }, { h: 26, d: 0.2 }, { h: 20, d: 0.3 }, { h: 14, d: 0.4 }, { h: 24, d: 0.5 }, { h: 10, d: 0.6 }].map((b, i) => (
              <WaveBar key={i} height={b.h} delay={b.d} />
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              style={{
                background: "linear-gradient(135deg,#D97706,#E07B00)", color: "#0D1F0D",
                padding: "16px 36px", borderRadius: 50, fontWeight: 700, fontSize: "1rem",
                textDecoration: "none", boxShadow: "0 8px 32px rgba(245,158,11,0.35)", transition: "all 0.3s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              Start Learning Free
            </Link>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); goTo(2); }}
              style={{
                border: "2px solid #EA580C", color: "#EA580C", padding: "14px 32px", borderRadius: 50,
                fontWeight: 700, fontSize: "1rem", textDecoration: "none", background: "transparent", transition: "all 0.3s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EA580C"; (e.currentTarget as HTMLElement).style.color = "#1C2B1A"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#EA580C"; }}
            >
              Watch How It Works
            </a>
          </div>
        </div>

      </div>

      {/* Welcome message */}
      {isSignedIn && (
        <div style={{
          position: "absolute", bottom: 88, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20, textAlign: "center", whiteSpace: "nowrap",
        }}>
          <span style={{
            fontFamily: ff.jakarta, fontSize: "1rem", fontWeight: 600,
            color: "#FDE68A", letterSpacing: "0.04em",
            background: "rgba(13,5,2,0.45)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(217,119,6,0.35)",
            padding: "8px 22px", borderRadius: 50,
          }}>
            Welcome back, <span style={{ color: "#D97706" }}>{displayName}</span> 👋
          </span>
        </div>
      )}

      {/* Carousel dots */}
      <div style={{
        position: "absolute", bottom: 36, right: 48,
        display: "flex", gap: 8, zIndex: 20,
      }}>
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setBgIndex(i)}
            aria-label={`Show banner ${i + 1}`}
            style={{
              width: bgIndex === i ? 22 : 8, height: 8,
              borderRadius: 4, padding: 0, cursor: "pointer", border: "none",
              background: bgIndex === i ? "#D97706" : "rgba(217,119,6,0.35)",
              transition: "all 0.4s ease",
              boxShadow: bgIndex === i ? "0 0 10px rgba(217,119,6,0.6)" : "none",
            }}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <button
        onClick={() => goTo(1)}
        style={{
          position: "absolute", bottom: 32, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          animation: "vs-hint-bounce 2s ease-in-out infinite",
          cursor: "pointer", zIndex: 20, background: "none", border: "none",
        }}
      >
        <span style={{ fontFamily: ff.space, fontSize: "0.62rem", color: "rgba(255,220,120,0.75)", letterSpacing: "0.12em" }}>SCROLL DOWN</span>
        <span style={{ color: "#FBB84B", opacity: 0.85, fontSize: "1.2rem" }}>↓</span>
      </button>

      <style>{`
        @media (max-width: 900px) {
          .hero-inner { padding: 90px 28px 40px !important; height: auto !important; }
        }
      `}</style>
    </section>
  );
}

// ── S2: PROBLEM ──
function ProblemSection({ isActive }: { isActive: boolean }) {
  const [counts, setCounts] = useState([0, 0, 0]);
  const ran = useRef(false);

  useEffect(() => {
    if (!isActive || ran.current) return;
    ran.current = true;
    const targets = [47, 23, 1];
    const dur = 2000, step = 16;
    targets.forEach((target, i) => {
      const inc = target / (dur / step);
      let val = 0;
      const timer = setInterval(() => {
        val += inc;
        if (val >= target) { val = target; clearInterval(timer); }
        setCounts((prev) => { const next = [...prev]; next[i] = Math.round(val); return next; });
      }, step);
    });
  }, [isActive]);

  const BgWave = () => {
    const bars = Array.from({ length: 80 }, (_, i) => ({
      h: 20 + Math.random() * 60,
      delay: Math.random() * 3,
      dur: 2 + Math.random() * 2,
    }));
    return (
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, display: "flex", alignItems: "flex-end", gap: 2, overflow: "hidden", opacity: 0.07 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, height: b.h, background: "#D97706", borderRadius: "2px 2px 0 0", animation: `vs-bg-wave ${b.dur}s ease-in-out ${b.delay}s infinite` }} />
        ))}
      </div>
    );
  };

  const statData = [
    { icon: "⚠️", num: `${counts[0]}%`, label: "job loss due to\nmiscommunication abroad", accent: "#F472B6", glow: "rgba(244,114,182,0.25)" },
    { icon: "🗣️", num: `${counts[1]}`, label: "Indian languages spoken,\nzero job-specific training available", accent: "#34D399", glow: "rgba(52,211,153,0.25)" },
    { icon: "🌏", num: `Day ${counts[2]}`, label: "abroad is the most critical —\nand the most unprepared", accent: "#FBBF24", glow: "rgba(251,191,36,0.25)" },
  ];

  return (
    <section style={{
      width: "100%", height: "100%",
      background: "linear-gradient(145deg, #0D1F1A 0%, #111827 45%, #1A0F2E 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 52, padding: "80px 64px", position: "relative", overflow: "hidden",
      fontFamily: ff.jakarta,
    }}>
      {/* Ambient glow orbs */}
      <div style={{ position: "absolute", top: "10%", left: "8%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <BgWave />

      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 1.5, background: "linear-gradient(90deg, transparent, #EA580C)" }} />
        <span style={{ fontFamily: ff.space, fontSize: "0.72rem", letterSpacing: "0.18em", color: "#EA580C", textTransform: "uppercase" }}>The Real Problem</span>
        <div style={{ width: 32, height: 1.5, background: "linear-gradient(90deg, #EA580C, transparent)" }} />
      </div>

      {/* Headline */}
      <div style={{
        fontFamily: ff.playfair, fontSize: "clamp(2rem,3.5vw,3.2rem)", fontWeight: 700,
        color: "#FDE68A", textAlign: "center", lineHeight: 1.25, maxWidth: 800, margin: 0,
      }}>
        <span style={{ color: "#F472B6" }}>1.8 Billion</span> migrant workers.<br />
        Most can&apos;t ask for help on their <span style={{ color: "#FBBF24" }}>first day.</span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {statData.map((s, i) => (
          <div key={i}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${s.accent}30`,
              borderRadius: 24, padding: "36px 32px", width: 272,
              backdropFilter: "blur(16px)",
              textAlign: "center", position: "relative", overflow: "hidden",
              transition: "transform 0.35s, box-shadow 0.35s, border-color 0.35s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = "translateY(-10px)"
              el.style.boxShadow = `0 24px 64px ${s.glow}`
              el.style.borderColor = `${s.accent}70`
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = "translateY(0)"
              el.style.boxShadow = "none"
              el.style.borderColor = `${s.accent}30`
            }}
          >
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)`, borderRadius: 2 }} />
            <div style={{ fontSize: "2rem", marginBottom: 14 }}>{s.icon}</div>
            <div style={{
              fontFamily: ff.playfair, fontSize: "3.2rem", fontWeight: 900,
              color: s.accent,
              textShadow: `0 0 32px ${s.glow}`,
            }}>{s.num}</div>
            <div style={{ fontSize: "0.88rem", color: "rgba(253,230,138,0.70)", marginTop: 12, lineHeight: 1.6, whiteSpace: "pre-line" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── S3: SOLUTION ──
function SolutionSection({ isActive }: { isActive: boolean }) {
  const glowRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isActive || glowRef.current) return;
    glowRef.current = true;
    const cards = document.querySelectorAll<HTMLElement>(".agent-card");
    let i = 0;
    const seq = setInterval(() => {
      cards.forEach((c) => { c.style.borderColor = "rgba(217,119,6,0.30)"; c.style.color = "#1C2B1A"; c.style.boxShadow = "none"; c.style.transform = "scale(1)"; });
      if (i < cards.length) {
        cards[i].style.borderColor = "#D97706";
        cards[i].style.color = "#D97706";
        cards[i].style.boxShadow = "0 0 20px rgba(245,158,11,0.25)";
        cards[i].style.transform = "scale(1.04)";
        i++;
      } else {
        clearInterval(seq);
      }
    }, 350);
  }, [isActive]);

  const nativeAgents = ["Telugu", "Hindi", "Tamil", "Kannada"];
  const globalAgents = ["Dubai 🇦🇪", "Japan 🇯🇵", "UK 🇬🇧", "USA 🇺🇸"];

  const AgentCard = ({ label, color }: { label: string; color: string }) => (
    <div className="agent-card" style={{
      background: "rgba(255,255,255,0.70)", border: "1px solid rgba(217,119,6,0.30)",
      borderRadius: 14, padding: "14px 18px", fontSize: "0.82rem", color: "#1C2B1A",
      minWidth: 140, display: "flex", alignItems: "center", gap: 10,
      transition: "all 0.4s ease", cursor: "default", fontFamily: ff.jakarta,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </div>
  );

  const steps = [
    { n: 1, title: "Speak your language", text: "Talk naturally in Telugu, Hindi, Tamil, or any native language" },
    { n: 2, title: "AI understands your goal", text: "Multi-agent AI routes your intent to the right vocational context" },
    { n: 3, title: "Learn what you need", text: "Get job-specific phrases, pronunciation, and live feedback" },
  ];

  return (
    <section style={{
      width: "100%", height: "100%", background: "#EAF6F1",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 48, padding: "80px 64px", overflow: "auto", fontFamily: ff.jakarta,
    }}>
      <div style={{ fontFamily: ff.space, fontSize: "0.72rem", letterSpacing: "0.15em", color: "#EA580C", textTransform: "uppercase", textAlign: "center" }}>
        HOW IT WORKS
      </div>
      <div style={{ fontFamily: ff.playfair, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 700, color: "#2A1A0A", textAlign: "center", margin: 0 }}>
        Multi-Agent AI. One Seamless Voice Bridge.
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap", width: "100%", maxWidth: 1100 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {nativeAgents.map((a) => <AgentCard key={a} label={`NativeLingo — ${a}`} color="#059669" />)}
        </div>

        <div style={{ flex: 1, height: 2, maxWidth: 60, background: "linear-gradient(to right,#D97706,transparent)", animation: "vs-flow-line 2s ease-in-out infinite" }} />

        <div style={{
          background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(249,115,22,0.1))",
          border: "2px solid #D97706", borderRadius: 20, padding: "24px 28px", textAlign: "center", minWidth: 180,
          animation: "vs-center-pulse 3s ease-in-out infinite",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>🧠</div>
          <div style={{ fontFamily: ff.playfair, fontSize: "1rem", color: "#D97706", fontWeight: 700 }}>Steering Manager</div>
          <div style={{ fontSize: "0.75rem", color: "#5A4A2A", marginTop: 4 }}>Gemini ADK Core</div>
        </div>

        <div style={{ flex: 1, height: 2, maxWidth: 60, background: "linear-gradient(to left,#D97706,transparent)", animation: "vs-flow-line 2s ease-in-out infinite" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {globalAgents.map((a) => <AgentCard key={a} label={`GlobalVocation — ${a}`} color="#EA580C" />)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, width: "100%", maxWidth: 800 }} className="flow-steps-wrap">
        {steps.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", padding: "20px 16px", position: "relative" }}>
            {i < steps.length - 1 && (
              <span style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)", color: "#D97706", fontSize: "1.4rem" }}>→</span>
            )}
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "linear-gradient(135deg,#D97706,#EA580C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "1.1rem", color: "#0D1F0D", margin: "0 auto 12px",
            }}>{s.n}</div>
            <div style={{ fontWeight: 600, color: "#2A1A0A", marginBottom: 4, fontSize: "0.92rem" }}>{s.title}</div>
            <div style={{ fontSize: "0.85rem", color: "#5A4A2A", lineHeight: 1.5 }}>{s.text}</div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 580px) {
          .flow-steps-wrap { flex-direction: column; align-items: center; }
        }
      `}</style>
    </section>
  );
}

// ── S4: FEATURES ──
function FeaturesSection() {
  const feats = [
    { icon: "🎙️", title: "Voice First", desc: "No reading, no typing. Just speak and learn the way humans are meant to communicate.", accent: "#FBBF24", glow: "rgba(251,191,36,0.22)" },
    { icon: "🤖", title: "Multi-Agent AI", desc: "Specialized AI agents for each language and vocation, orchestrated intelligently by Gemini ADK.", accent: "#A78BFA", glow: "rgba(167,139,250,0.22)" },
    { icon: "🔧", title: "Job Specific", desc: "Driver phrases for Dubai, construction terms for Japan, hospitality scripts for UK.", accent: "#34D399", glow: "rgba(52,211,153,0.22)" },
    { icon: "🌺", title: "Native Language", desc: "Learn in your mother tongue first. Telugu, Hindi, Tamil, Kannada, Marathi — all supported.", accent: "#F472B6", glow: "rgba(244,114,182,0.22)" },
    { icon: "⚡", title: "Live Feedback", desc: "Real-time pronunciation scoring, tone correction, and confidence building.", accent: "#38BDF8", glow: "rgba(56,189,248,0.22)" },
    { icon: "📊", title: "Progress Reports", desc: "Track readiness for Day 1 abroad. Share progress with family and employers.", accent: "#FB923C", glow: "rgba(251,146,60,0.22)" },
  ];

  return (
    <section style={{
      width: "100%", height: "100%",
      background: "linear-gradient(135deg, #1E1040 0%, #2D1B69 40%, #1A2744 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 44, padding: "80px 64px", overflow: "auto", fontFamily: ff.jakarta,
      position: "relative",
    }}>
      {/* Mesh glow blobs */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 1.5, background: "linear-gradient(90deg, transparent, #A78BFA)" }} />
        <span style={{ fontFamily: ff.space, fontSize: "0.72rem", letterSpacing: "0.18em", color: "#A78BFA", textTransform: "uppercase" }}>Platform Features</span>
        <div style={{ width: 32, height: 1.5, background: "linear-gradient(90deg, #A78BFA, transparent)" }} />
      </div>

      {/* Headline */}
      <div style={{ fontFamily: ff.playfair, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 700, color: "#E9D5FF", textAlign: "center", margin: 0 }}>
        Built for Real Workers. <span style={{ color: "#FBBF24" }}>Powered by Real AI.</span>
      </div>

      {/* Cards grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20,
        width: "100%", maxWidth: 1000,
      }} className="features-grid">
        {feats.map((f, i) => (
          <div key={i}
            style={{
              background: `linear-gradient(145deg, ${f.accent}12 0%, ${f.accent}06 100%)`,
              border: `1px solid ${f.accent}45`,
              borderRadius: 20, padding: "28px 24px",
              backdropFilter: "blur(16px)",
              transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
              cursor: "default", position: "relative", overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-10px) scale(1.02)";
              el.style.borderColor = `${f.accent}90`;
              el.style.boxShadow = `0 24px 60px ${f.glow}, inset 0 1px 0 ${f.accent}30`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0) scale(1)";
              el.style.borderColor = `${f.accent}45`;
              el.style.boxShadow = "none";
            }}
          >
            <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 2, background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)` }} />
            <div style={{
              width: 52, height: 52, borderRadius: 14, marginBottom: 18,
              background: `${f.accent}22`, border: `1.5px solid ${f.accent}50`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem",
              boxShadow: `0 4px 20px ${f.glow}`,
            }}>{f.icon}</div>
            <div style={{ fontFamily: ff.playfair, fontSize: "1.15rem", fontWeight: 700, color: f.accent, marginBottom: 10 }}>{f.title}</div>
            <div style={{ fontSize: "0.84rem", color: "rgba(233,213,255,0.70)", lineHeight: 1.65 }}>{f.desc}</div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 580px) { .features-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

// ── S5: PERSONAS ──
function PersonasSection() {
  const personas = [
    { icon: "🚗", name: "Raju", job: "Driver", from: "Telugu", to: "Arabic", origin: "🇮🇳 Andhra Pradesh", dest: "🇦🇪 Dubai", accent: "#FBBF24", glow: "rgba(251,191,36,0.22)" },
    { icon: "🏠", name: "Priya", job: "Housekeeper", from: "Tamil", to: "English", origin: "🇮🇳 Tamil Nadu", dest: "🇬🇧 UK", accent: "#F472B6", glow: "rgba(244,114,182,0.22)" },
    { icon: "🏗️", name: "Arjun", job: "Construction", from: "Hindi", to: "Japanese", origin: "🇮🇳 Rajasthan", dest: "🇯🇵 Japan", accent: "#34D399", glow: "rgba(52,211,153,0.22)" },
    { icon: "🔧", name: "Suresh", job: "Plumber", from: "Kannada", to: "Arabic", origin: "🇮🇳 Karnataka", dest: "🇦🇪 Dubai", accent: "#A78BFA", glow: "rgba(167,139,250,0.22)" },
  ];

  return (
    <section style={{
      width: "100%", height: "100%",
      background: "linear-gradient(140deg, #1A0A00 0%, #2D1200 45%, #1A1A00 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 48, padding: "80px 64px", overflow: "auto", fontFamily: ff.jakarta,
      position: "relative",
    }}>
      {/* Warm mesh glow blobs */}
      <div style={{ position: "absolute", top: "-8%", left: "0%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-8%", right: "0%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 1.5, background: "linear-gradient(90deg, transparent, #FBBF24)" }} />
        <span style={{ fontFamily: ff.space, fontSize: "0.72rem", letterSpacing: "0.18em", color: "#FBBF24", textTransform: "uppercase" }}>Who It&apos;s For</span>
        <div style={{ width: 32, height: 1.5, background: "linear-gradient(90deg, #FBBF24, transparent)" }} />
      </div>

      {/* Headline */}
      <div style={{ fontFamily: ff.playfair, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 700, color: "#FDE68A", textAlign: "center", margin: 0, lineHeight: 1.25 }}>
        Real People. Real Dreams. <span style={{ color: "#F472B6" }}>Real Journeys.</span>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
        {personas.map((p, i) => (
          <div key={i}
            style={{
              background: `linear-gradient(160deg, ${p.accent}14 0%, ${p.accent}07 100%)`,
              border: `1px solid ${p.accent}50`,
              borderRadius: 24, padding: "36px 28px", width: 252,
              textAlign: "center", backdropFilter: "blur(16px)",
              transition: "all 0.35s ease", cursor: "default",
              position: "relative", overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-12px) scale(1.02)";
              el.style.borderColor = `${p.accent}90`;
              el.style.boxShadow = `0 28px 64px ${p.glow}, inset 0 1px 0 ${p.accent}25`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0) scale(1)";
              el.style.borderColor = `${p.accent}50`;
              el.style.boxShadow = "none";
            }}
          >
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)` }} />

            {/* Avatar */}
            <div style={{
              width: 76, height: 76, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px", fontSize: "2.2rem",
              background: `${p.accent}20`,
              border: `2px solid ${p.accent}55`,
              boxShadow: `0 0 28px ${p.glow}`,
            }}>{p.icon}</div>

            <div style={{ fontFamily: ff.playfair, fontSize: "1.25rem", fontWeight: 700, color: p.accent }}>{p.name}</div>
            <div style={{ fontSize: "0.85rem", color: "rgba(253,230,138,0.80)", fontWeight: 600, margin: "6px 0 16px" }}>{p.job}</div>

            {/* Language bridge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 16 }}>
              <span style={{
                background: `${p.accent}20`, border: `1px solid ${p.accent}55`,
                borderRadius: 50, padding: "4px 12px", fontSize: "0.76rem",
                color: p.accent, fontFamily: ff.space, fontWeight: 700,
              }}>{p.from}</span>
              <span style={{ color: "#FBBF24", fontSize: "1rem" }}>⟶</span>
              <span style={{
                background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.40)",
                borderRadius: 50, padding: "4px 12px", fontSize: "0.76rem",
                color: "#FBBF24", fontFamily: ff.space, fontWeight: 700,
              }}>{p.to}</span>
            </div>

            <div style={{ fontSize: "0.80rem", color: "rgba(253,230,138,0.55)", lineHeight: 1.6 }}>{p.origin} → {p.dest}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── S6: PRICING ──
function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const { isSignedIn } = useUser();

  const plans = [
    {
      key: 'free',
      name: 'Free',
      tagline: 'Try it out',
      monthlyPrice: 0,
      yearlyTotal: 0,
      color: '#C09050',
      glow: 'rgba(192,144,80,0.22)',
      border: 'rgba(192,144,80,0.38)',
      cta: 'Get Started',
      href: isSignedIn ? '/dashboard' : '/sign-up',
      badge: null as string | null,
      features: [
        '5 min per session',
        '2 sessions / month',
        'Hindi & Telugu',
        'Dubai & Russia only',
        '2 job types',
        'Summary report only',
      ],
    },
    {
      key: 'plus',
      name: 'Plus',
      tagline: 'Daily learner',
      monthlyPrice: 199,
      yearlyTotal: 1990,
      color: '#D97706',
      glow: 'rgba(217,119,6,0.35)',
      border: 'rgba(217,119,6,0.72)',
      cta: 'Start Learning',
      href: isSignedIn ? '/dashboard' : '/sign-up',
      badge: '★ MOST POPULAR',
      features: [
        '20 min per session',
        '15 sessions / month',
        'All 5 languages',
        '3 destinations',
        'All 5 job types',
        'Full session report',
        '30-day history',
      ],
    },
    {
      key: 'pro',
      name: 'Pro',
      tagline: 'Serious job seeker',
      monthlyPrice: 499,
      yearlyTotal: 4990,
      color: '#059669',
      glow: 'rgba(5,150,105,0.28)',
      border: 'rgba(5,150,105,0.48)',
      cta: 'Go Pro',
      href: isSignedIn ? '/dashboard' : '/sign-up',
      badge: null as string | null,
      features: [
        '45 min per session',
        'Unlimited sessions',
        'All + future languages',
        'All destinations',
        'All jobs + Global agents',
        'Full report + PDF download',
        'All-time analytics',
        'WhatsApp support',
      ],
    },
  ];

  return (
    <section style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #0E0804 0%, #160C04 55%, #0A0E08 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 14, padding: '70px 40px 16px',
      position: 'relative', overflow: 'hidden',
      fontFamily: ff.jakarta,
    }}>
      {/* Dot grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(217,119,6,0.10) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }} />
      {/* Ambient radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(217,119,6,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: ff.space, fontSize: '0.62rem', letterSpacing: '0.2em', color: '#D97706', textTransform: 'uppercase', marginBottom: 6 }}>
          CHOOSE YOUR PATH
        </div>
        <h2 style={{ fontFamily: ff.playfair, fontSize: 'clamp(1.5rem,2.4vw,2.2rem)', fontWeight: 700, color: '#FFF8ED', margin: 0, lineHeight: 1.15 }}>
          Invest in Your{' '}
          <span style={{ background: 'linear-gradient(135deg,#D97706,#EA580C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Global Future
          </span>
        </h2>
      </div>

      {/* Billing toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <span style={{
          fontFamily: ff.space, fontSize: '0.66rem', letterSpacing: '0.12em',
          color: !yearly ? '#FFF8ED' : 'rgba(255,248,237,0.35)',
          transition: 'color 0.35s',
        }}>MONTHLY</span>
        <button
          type="button"
          onClick={() => setYearly(v => !v)}
          aria-label="Toggle billing period"
          style={{
            width: 50, height: 26, borderRadius: 13,
            background: yearly ? 'linear-gradient(135deg,#D97706,#EA580C)' : 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(217,119,6,0.45)',
            cursor: 'pointer', position: 'relative', outline: 'none',
            transition: 'background 0.4s',
          }}
        >
          <div style={{
            position: 'absolute', top: 3, left: yearly ? 25 : 3,
            width: 18, height: 18, borderRadius: '50%', background: '#FFF8ED',
            transition: 'left 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          }} />
        </button>
        <span style={{
          fontFamily: ff.space, fontSize: '0.66rem', letterSpacing: '0.12em',
          color: yearly ? '#D97706' : 'rgba(255,248,237,0.35)',
          transition: 'color 0.35s',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          YEARLY
          {yearly && (
            <span style={{
              background: 'linear-gradient(135deg,#059669,#047857)',
              color: '#fff', padding: '2px 7px', borderRadius: 6,
              fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em',
            }}>SAVE 17%</span>
          )}
        </span>
      </div>

      {/* Plan cards */}
      <div className="pricing-grid" style={{
        display: 'flex', gap: 16, alignItems: 'center',
        position: 'relative', zIndex: 1,
      }}>
        {plans.map((plan) => {
          const isCenter = plan.key === 'plus';
          const effectiveMonthly = plan.monthlyPrice === 0
            ? 0
            : yearly
            ? Math.round(plan.yearlyTotal / 12)
            : plan.monthlyPrice;

          return (
            <div
              key={plan.key}
              className={`pricing-card${isCenter ? ' pricing-card-featured' : ''}`}
              style={{
                position: 'relative',
                background: isCenter
                  ? 'linear-gradient(160deg, rgba(217,119,6,0.16) 0%, rgba(234,88,12,0.08) 100%)'
                  : 'rgba(255,255,255,0.035)',
                border: `1.5px solid ${plan.border}`,
                borderRadius: 20,
                padding: isCenter ? '36px 24px 22px' : '24px 20px',
                minWidth: isCenter ? 248 : 214,
                boxShadow: `0 0 50px ${plan.glow}, 0 12px 40px rgba(0,0,0,0.5)`,
                backdropFilter: 'blur(16px)',
                transform: isCenter ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.35s ease, box-shadow 0.35s ease',
              }}
            >
              {/* Popular ribbon */}
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg,#D97706,#EA580C)',
                  color: '#fff', padding: '3px 18px',
                  borderRadius: 20, fontFamily: ff.space,
                  fontSize: '0.58rem', letterSpacing: '0.15em',
                  boxShadow: '0 4px 18px rgba(217,119,6,0.5)',
                  whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Plan label */}
              <div style={{ fontFamily: ff.space, fontSize: '0.62rem', letterSpacing: '0.2em', color: plan.color, marginBottom: 2 }}>
                {plan.name.toUpperCase()}
              </div>
              <div style={{ fontFamily: ff.jakarta, fontSize: '0.72rem', color: 'rgba(255,248,237,0.45)', marginBottom: 10 }}>
                {plan.tagline}
              </div>

              {/* Price display */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 2 }}>
                <span style={{ fontFamily: ff.playfair, fontSize: '2.2rem', fontWeight: 700, color: '#FFF8ED', lineHeight: 1 }}>
                  {plan.monthlyPrice === 0 ? '₹0' : `₹${effectiveMonthly}`}
                </span>
                {plan.monthlyPrice > 0 && (
                  <span style={{ fontFamily: ff.jakarta, fontSize: '0.74rem', color: 'rgba(255,248,237,0.4)', marginBottom: 4 }}>
                    /mo
                  </span>
                )}
              </div>
              <div style={{ fontFamily: ff.jakarta, fontSize: '0.68rem', color: 'rgba(255,248,237,0.28)', marginBottom: 14 }}>
                {plan.monthlyPrice === 0
                  ? 'Always free'
                  : yearly
                  ? `Billed ₹${plan.yearlyTotal} annually`
                  : 'Billed monthly'}
              </div>

              {/* Gradient rule */}
              <div style={{
                height: 1, marginBottom: 12,
                background: `linear-gradient(90deg, transparent, ${plan.border}, transparent)`,
              }} />

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {plan.features.map((f, fi) => (
                  <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.74rem', color: 'rgba(255,248,237,0.78)', lineHeight: 1.35 }}>
                    <span style={{ color: plan.color, flexShrink: 0, fontSize: '0.6rem', marginTop: 3 }}>✦</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <a
                href={plan.href}
                className={`pricing-cta pricing-cta-${plan.key}`}
                style={{
                  display: 'block', textAlign: 'center',
                  padding: '10px 0', borderRadius: 50,
                  background: isCenter ? `linear-gradient(135deg,${plan.color},#EA580C)` : 'transparent',
                  border: `1.5px solid ${plan.border}`,
                  color: isCenter ? '#fff' : plan.color,
                  fontFamily: ff.jakarta, fontWeight: 700, fontSize: '0.8rem',
                  textDecoration: 'none', letterSpacing: '0.06em',
                  transition: 'all 0.3s ease',
                  boxShadow: isCenter ? `0 4px 20px ${plan.glow}` : 'none',
                }}
              >
                {plan.cta} →
              </a>
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: ff.jakarta, fontSize: '0.68rem', color: 'rgba(255,248,237,0.22)', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        No credit card required for Free · Cancel anytime · Prices in INR
      </div>

      <style>{`
        @media (max-width: 960px) {
          .pricing-grid { flex-direction: column !important; align-items: stretch !important; gap: 14px !important; }
          .pricing-card-featured { transform: scale(1) !important; }
          .pricing-card { min-width: unset !important; }
        }
        .pricing-card:hover { transform: translateY(-8px) !important; }
        .pricing-card-featured:hover { transform: scale(1.05) translateY(-8px) !important; }
        .pricing-cta-free:hover  { background: rgba(192,144,80,0.18) !important; }
        .pricing-cta-plus:hover  { filter: brightness(1.12) !important; }
        .pricing-cta-pro:hover   { background: rgba(5,150,105,0.22) !important; color: #fff !important; }
      `}</style>
    </section>
  );
}

// ── S7: TECH ──
function TechSection() {
  const techs = [
    { logo: "⚡", name: "Next.js", desc: "Full-stack React framework", accent: "#38BDF8", glow: "rgba(56,189,248,0.22)" },
    { logo: "🤖", name: "Google ADK", desc: "Multi-agent orchestration", accent: "#A78BFA", glow: "rgba(167,139,250,0.22)" },
    { logo: "🌟", name: "Gemini AI", desc: "Voice & language intelligence", accent: "#FBBF24", glow: "rgba(251,191,36,0.22)" },
    { logo: "🔐", name: "Clerk", desc: "Auth & user management", accent: "#F472B6", glow: "rgba(244,114,182,0.22)" },
    { logo: "🗄️", name: "Neon DB", desc: "Serverless Postgres", accent: "#34D399", glow: "rgba(52,211,153,0.22)" },
    { logo: "⚙️", name: "Inngest", desc: "Durable background workflows", accent: "#FB923C", glow: "rgba(251,146,60,0.22)" },
  ];

  return (
    <section style={{
      width: "100%", height: "100%",
      background: "linear-gradient(145deg, #020817 0%, #0A1628 50%, #050D1A 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 44, padding: "80px 64px", position: "relative", overflow: "hidden",
      fontFamily: ff.jakarta,
    }}>
      {/* Circuit grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        pointerEvents: "none",
      }} />
      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "-10%", left: "15%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "15%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
        <div style={{ width: 32, height: 1.5, background: "linear-gradient(90deg, transparent, #38BDF8)" }} />
        <span style={{ fontFamily: ff.space, fontSize: "0.72rem", letterSpacing: "0.18em", color: "#38BDF8", textTransform: "uppercase" }}>Built With</span>
        <div style={{ width: 32, height: 1.5, background: "linear-gradient(90deg, #38BDF8, transparent)" }} />
      </div>

      {/* Headline */}
      <div style={{ fontFamily: ff.playfair, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 700, color: "#E0F2FE", textAlign: "center", margin: 0, position: "relative", zIndex: 1 }}>
        Enterprise-Grade <span style={{ color: "#38BDF8" }}>AI Infrastructure</span>
      </div>

      {/* Cards */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 780 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="tech-grid">
          {techs.map((t, i) => (
            <div key={i}
              style={{
                background: `linear-gradient(145deg, ${t.accent}10 0%, ${t.accent}05 100%)`,
                border: `1px solid ${t.accent}40`,
                borderRadius: 18, padding: "26px 20px", textAlign: "center",
                backdropFilter: "blur(16px)",
                transition: "all 0.35s ease",
                animation: `vs-tech-float 4s ease-in-out ${i * 0.5}s infinite`,
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-12px) scale(1.04)";
                el.style.borderColor = `${t.accent}90`;
                el.style.boxShadow = `0 24px 60px ${t.glow}, inset 0 1px 0 ${t.accent}25`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "";
                el.style.borderColor = `${t.accent}40`;
                el.style.boxShadow = "none";
              }}
            >
              {/* Top accent line */}
              <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} />
              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: "0 auto 14px",
                background: `${t.accent}18`, border: `1.5px solid ${t.accent}45`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.8rem", boxShadow: `0 4px 20px ${t.glow}`,
              }}>{t.logo}</div>
              <div style={{ fontFamily: ff.space, fontSize: "0.80rem", color: t.accent, letterSpacing: "0.08em", fontWeight: 700 }}>{t.name}</div>
              <div style={{ fontSize: "0.74rem", color: "rgba(224,242,254,0.55)", marginTop: 6, lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div style={{ fontFamily: ff.playfair, fontSize: "1.05rem", color: "rgba(224,242,254,0.50)", textAlign: "center", fontStyle: "italic", position: "relative", zIndex: 1 }}>
        &ldquo;Built for scale. Designed for the world&apos;s hardest workers.&rdquo;
      </div>

      <style>{`
        @media (max-width: 900px) { .tech-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </section>
  );
}

// ── S7: CTA ──
function CTASection() {
  const { isSignedIn } = useUser();
  const bars = [12, 28, 40, 50, 40, 28, 16, 36, 44];
  return (
    <section style={{
      width: "100%", height: "100%",
      background: "linear-gradient(135deg,#FFF3E0 0%,#FEF9C3 50%,#ECFDF5 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 40, textAlign: "center", padding: "80px 64px",
      fontFamily: ff.jakarta,
    }}>
      <div style={{
        fontFamily: ff.playfair, fontSize: "clamp(2rem,4vw,3.8rem)", fontWeight: 900,
        color: "#1C2B1A", lineHeight: 1.1, maxWidth: 700, margin: 0,
      }}>
        Your global career starts with<br />
        <span style={{ background: "linear-gradient(135deg,#D97706,#EA580C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          one conversation.
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", height: 50 }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            width: 4, height: h, background: "linear-gradient(to top,#EA580C,#D97706)",
            borderRadius: 4, animation: `vs-cta-wave 1.5s ease-in-out ${i * 0.1}s infinite`,
          }} />
        ))}
      </div>

      <Link
        href={isSignedIn ? "/dashboard" : "/sign-up"}
        style={{
          background: "linear-gradient(135deg,#D97706,#B45309)", color: "#fff",
          padding: "22px 56px", borderRadius: 50, fontWeight: 800, fontSize: "1.2rem",
          textDecoration: "none", animation: "vs-cta-glow 2.5s ease-in-out infinite",
          letterSpacing: "0.02em", display: "inline-block", transition: "all 0.3s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg,#EA580C,#C2410C)"; (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg,#D97706,#B45309)"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      >
        Try ViswaSethu Free →
      </Link>

      <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
        {["About", "Privacy", "Terms", "Contact", "Instagram", "LinkedIn"].map((l) => (
          <a key={l} href="#" style={{ color: "#5A4A2A", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.3s" }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#D97706"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#5A4A2A"; }}
          >{l}</a>
        ))}
      </div>

      <div style={{ fontFamily: ff.playfair, fontStyle: "italic", color: "#8A7A5A", fontSize: "0.9rem" }}>
        © 2026 ViswaSethu · Empowering Dreams. Building Global Futures.
      </div>
    </section>
  );
}

// ── MAIN LANDING PAGE ──
export default function LandingPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const currentRef = useRef(0);
  const transitioningRef = useRef(false);

  const goTo = useCallback((idx: number) => {
    if (transitioningRef.current || idx === currentRef.current || idx < 0 || idx >= TOTAL) return;
    transitioningRef.current = true;
    setDirection(idx > currentRef.current ? 1 : -1);
    currentRef.current = idx;
    setCurrent(idx);
    setTimeout(() => { transitioningRef.current = false; }, 850);
  }, []);

  useEffect(() => {
    const HASH_INDEX: Record<string, number> = {
      pricing: 6, features: 3, solution: 2, tech: 5,
    };
    const hash = window.location.hash.replace('#', '')
    if (hash && HASH_INDEX[hash] !== undefined) {
      setTimeout(() => goTo(HASH_INDEX[hash]), 50)
    }
  }, [goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") goTo(currentRef.current + 1);
      if (e.key === "ArrowUp" || e.key === "PageUp") goTo(currentRef.current - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goTo]);

  useEffect(() => {
    let wheelTimer: ReturnType<typeof setTimeout>;
    const handleWheel = (e: WheelEvent) => {
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (e.deltaY > 40) goTo(currentRef.current + 1);
        else if (e.deltaY < -40) goTo(currentRef.current - 1);
      }, 20);
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => { window.removeEventListener("wheel", handleWheel); clearTimeout(wheelTimer); };
  }, [goTo]);

  useEffect(() => {
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 50) goTo(dy > 0 ? currentRef.current + 1 : currentRef.current - 1);
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onTouchStart); window.removeEventListener("touchend", onTouchEnd); };
  }, [goTo]);

  const sections = [
    <HeroSection key="hero" goTo={goTo} />,
    <ProblemSection key="problem" isActive={current === 1} />,
    <SolutionSection key="solution" isActive={current === 2} />,
    <FeaturesSection key="features" />,
    <PersonasSection key="personas" />,
    <TechSection key="tech" />,
    <PricingSection key="pricing" />,
    <CTASection key="cta" />,
  ];

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative", background: "#FFF8ED" }}>
      <Navbar current={current} goTo={goTo} />
      <DotNav current={current} goTo={goTo} />

      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={current}
            custom={direction}
            variants={sectionVariants}
            initial="enter"
            animate="active"
            exit="exit"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            {sections[current]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
