"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

const TOTAL = 7;

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
function Navbar({ current, goTo }: { current: number; goTo: (i: number) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const links = [
    { label: "Problem", idx: 1 },
    { label: "Solution", idx: 2 },
    { label: "Features", idx: 3 },
    { label: "Who It's For", idx: 4 },
    { label: "Tech", idx: 5 },
  ];

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

      {/* Desktop links */}
      <div className="nav-links-desktop" style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {links.map((l) => (
          <a
            key={l.idx}
            href="#"
            onClick={(e) => { e.preventDefault(); goTo(l.idx); }}
            style={{ color: "#1C2B1A", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, opacity: current === l.idx ? 1 : 0.8, transition: "all 0.3s", letterSpacing: "0.03em" }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#D97706"; (e.target as HTMLElement).style.opacity = "1"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#1C2B1A"; (e.target as HTMLElement).style.opacity = current === l.idx ? "1" : "0.8"; }}
          >
            {l.label}
          </a>
        ))}
        {isSignedIn && (
          <UserButton
            appearance={{
              elements: {
                avatarBox: {
                  width: 38,
                  height: 38,
                  border: "2px solid #D97706",
                  borderRadius: "50%",
                },
              },
            }}
          />
        )}
      </div>

      {/* Mobile burger */}
      <button
        className="nav-burger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
        style={{ display: "none", flexDirection: "column", gap: 5, cursor: "pointer", background: "none", border: "none", padding: 4 }}
      >
        <span style={{ width: 24, height: 2, background: "#1C2B1A", borderRadius: 2, display: "block" }} />
        <span style={{ width: 24, height: 2, background: "#1C2B1A", borderRadius: 2, display: "block" }} />
        <span style={{ width: 24, height: 2, background: "#1C2B1A", borderRadius: 2, display: "block" }} />
      </button>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(255,248,237,0.98)", zIndex: 800,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 28, fontSize: "1.4rem",
          }}
        >
          {links.map((l) => (
            <a key={l.idx} href="#" onClick={(e) => { e.preventDefault(); goTo(l.idx); }}
              style={{ color: "#1C2B1A", textDecoration: "none", fontWeight: 500 }}>
              {l.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .nav-links-desktop { display: none !important; }
          .nav-burger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

// ── DOT NAV ──
function DotNav({ current, goTo }: { current: number; goTo: (i: number) => void }) {
  const labels = ["Hero", "Problem", "Solution", "Features", "Users", "Tech Stack", "Get Started"];
  return (
    <div style={{ position: "fixed", right: 28, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 14, zIndex: 1000 }}>
      {labels.map((label, i) => (
        <button
          key={i}
          title={label}
          onClick={() => goTo(i)}
          style={{
            width: 10, height: 10, borderRadius: "50%", cursor: "pointer", padding: 0,
            background: current === i ? "#D97706" : "rgba(217,119,6,0.2)",
            border: `1.5px solid ${current === i ? "#D97706" : "rgba(217,119,6,0.5)"}`,
            boxShadow: current === i ? "0 0 12px rgba(217,119,6,0.5)" : "none",
            transform: current === i ? "scale(1.4)" : "scale(1)",
            transition: "all 0.4s ease",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── S1: HERO ──
function HeroSection({ goTo }: { goTo: (i: number) => void }) {
  const pCanvasRef = useRef<HTMLCanvasElement>(null);
  const { isSignedIn, user } = useUser();
  const displayName = user?.username ?? user?.firstName ?? "there";

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

  const WaveBar = ({ delay, height }: { delay: number; height: number }) => (
    <div style={{
      width: 3, height, borderRadius: 2, background: "#D97706", opacity: 0.5,
      animation: `vs-wave-bar 1.2s ease-in-out ${delay}s infinite`,
    }} />
  );

  return (
    <section style={{
      width: "100%", height: "100%", position: "relative", overflow: "hidden",
      backgroundImage: "url('https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1777292512/bannerimage1_uodots.png')",
      backgroundSize: "98% auto", backgroundPosition: "center top", backgroundRepeat: "no-repeat",
      backgroundColor: "#0D0502",
      display: "flex", alignItems: "center", justifyContent: "flex-start",
    }}>
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
            The Bridge<br />of <span style={{ color: "#D97706" }}>Trust</span>
          </h1>

          <p style={{ fontSize: "clamp(1rem,1.5vw,1.2rem)", color: "rgba(255,248,237,0.85)", lineHeight: 1.6, maxWidth: 500, margin: 0 }}>
            AI-powered voice learning. Your language → Global opportunity. Learn exactly what you need to speak on your first day of work abroad.
          </p>

          <div style={{ display: "flex", gap: 3, height: 30, alignItems: "center", marginTop: 4 }}>
            {[{ h: 8, d: 0 }, { h: 18, d: 0.1 }, { h: 26, d: 0.2 }, { h: 20, d: 0.3 }, { h: 14, d: 0.4 }, { h: 24, d: 0.5 }, { h: 10, d: 0.6 }].map((b, i) => (
              <WaveBar key={i} height={b.h} delay={b.d} />
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
            <Link
              href="/sign-up"
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
    { icon: "⚠️", num: `${counts[0]}%`, label: "job loss due to\nmiscommunication abroad" },
    { icon: "🗣️", num: `${counts[1]}`, label: "Indian languages spoken,\nzero job-specific training available" },
    { icon: "🌏", num: `Day ${counts[2]}`, label: "abroad is the most critical —\nand the most unprepared" },
  ];

  return (
    <section style={{
      width: "100%", height: "100%", background: "#F3F7F0",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 60, padding: "80px 64px", position: "relative", overflow: "hidden",
      fontFamily: ff.jakarta,
    }}>
      <BgWave />
      <div style={{ fontFamily: ff.space, fontSize: "0.72rem", letterSpacing: "0.15em", color: "#EA580C", textTransform: "uppercase", textAlign: "center" }}>
        THE REAL PROBLEM
      </div>
      <div style={{
        fontFamily: ff.playfair, fontSize: "clamp(2rem,3.5vw,3.2rem)", fontWeight: 700,
        color: "#2A1A0A", textAlign: "center", lineHeight: 1.2, maxWidth: 800, margin: 0,
      }}>
        <span style={{ color: "#92400E" }}>1.8 Billion</span> migrant workers.<br />
        Most can&apos;t ask for help on their <span style={{ color: "#D97706" }}>first day.</span>
      </div>
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
        {statData.map((s, i) => (
          <div key={i}
            style={{
              background: "rgba(255,255,255,0.70)", border: "1px solid rgba(217,119,6,0.30)",
              borderRadius: 20, padding: "36px 32px", width: 280, backdropFilter: "blur(12px)",
              textAlign: "center", position: "relative", overflow: "hidden",
              transition: "transform 0.4s,box-shadow 0.4s", cursor: "default",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(245,158,11,0.15)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>{s.icon}</div>
            <div style={{
              fontFamily: ff.playfair, fontSize: "3.2rem", fontWeight: 900,
              background: "linear-gradient(135deg,#D97706,#EA580C)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{s.num}</div>
            <div style={{ fontSize: "0.95rem", color: "#5A4A2A", marginTop: 10, lineHeight: 1.5, whiteSpace: "pre-line" }}>{s.label}</div>
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
    { icon: "🎙️", title: "Voice First", desc: "No reading, no typing. Just speak and learn the way humans are meant to communicate." },
    { icon: "🤖", title: "Multi-Agent AI", desc: "Specialized AI agents for each language and vocation, orchestrated intelligently by Gemini ADK." },
    { icon: "🔧", title: "Job Specific", desc: "Driver phrases for Dubai, construction terms for Japan, hospitality scripts for UK." },
    { icon: "🌺", title: "Native Language", desc: "Learn in your mother tongue first. Telugu, Hindi, Tamil, Kannada, Marathi — all supported." },
    { icon: "⚡", title: "Live Feedback", desc: "Real-time pronunciation scoring, tone correction, and confidence building." },
    { icon: "📊", title: "Progress Reports", desc: "Track readiness for Day 1 abroad. Share progress with family and employers." },
  ];

  return (
    <section style={{
      width: "100%", height: "100%", background: "#FFF3E0",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 48, padding: "80px 64px", overflow: "auto", fontFamily: ff.jakarta,
    }}>
      <div style={{ fontFamily: ff.space, fontSize: "0.72rem", letterSpacing: "0.15em", color: "#EA580C", textTransform: "uppercase", textAlign: "center" }}>
        PLATFORM FEATURES
      </div>
      <div style={{ fontFamily: ff.playfair, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 700, color: "#2A1A0A", textAlign: "center", margin: 0 }}>
        Built for Real Workers. Powered by Real AI.
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20,
        width: "100%", maxWidth: 1000, perspective: 1200,
      }} className="features-grid">
        {feats.map((f, i) => (
          <div key={i}
            style={{
              background: "rgba(255,255,255,0.70)", border: "1px solid rgba(217,119,6,0.30)",
              borderRadius: 18, padding: "28px 24px",
              transform: "rotateX(3deg) rotateY(-2deg)",
              transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)", cursor: "default", position: "relative", overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "rotateX(0deg) rotateY(0deg) translateY(-10px) translateZ(20px)";
              el.style.borderColor = "#D97706";
              el.style.boxShadow = "0 24px 60px rgba(245,158,11,0.2),0 0 0 1px rgba(245,158,11,0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "rotateX(3deg) rotateY(-2deg)";
              el.style.borderColor = "rgba(217,119,6,0.30)";
              el.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "2.4rem", marginBottom: 16 }}>{f.icon}</div>
            <div style={{ fontFamily: ff.playfair, fontSize: "1.2rem", fontWeight: 700, color: "#2A1A0A", marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: "0.84rem", color: "#5A4A2A", lineHeight: 1.6 }}>{f.desc}</div>
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
    { icon: "🚗", name: "Raju", job: "Driver", from: "Telugu", to: "Arabic", origin: "🇮🇳 Andhra Pradesh", dest: "🇦🇪 Dubai" },
    { icon: "🏠", name: "Priya", job: "Housekeeper", from: "Tamil", to: "English", origin: "🇮🇳 Tamil Nadu", dest: "🇬🇧 UK" },
    { icon: "🏗️", name: "Arjun", job: "Construction", from: "Hindi", to: "Japanese", origin: "🇮🇳 Rajasthan", dest: "🇯🇵 Japan" },
    { icon: "🔧", name: "Suresh", job: "Plumber", from: "Kannada", to: "Arabic", origin: "🇮🇳 Karnataka", dest: "🇦🇪 Dubai" },
  ];

  return (
    <section style={{
      width: "100%", height: "100%", background: "#FFF8ED",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 48, padding: "80px 64px", overflow: "auto", fontFamily: ff.jakarta,
    }}>
      <div style={{ fontFamily: ff.space, fontSize: "0.72rem", letterSpacing: "0.15em", color: "#EA580C", textTransform: "uppercase", textAlign: "center" }}>
        WHO IT&apos;S FOR
      </div>
      <div style={{ fontFamily: ff.playfair, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 700, color: "#2A1A0A", textAlign: "center", margin: 0 }}>
        Real People. Real Dreams. Real Journeys.
      </div>
      <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
        {personas.map((p, i) => (
          <div key={i}
            style={{
              background: "rgba(255,255,255,0.70)", border: "1px solid rgba(217,119,6,0.30)",
              borderRadius: 24, padding: "36px 28px", width: 260, textAlign: "center",
              transition: "all 0.4s ease", cursor: "default", position: "relative", overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-12px)";
              el.style.borderColor = "#EA580C";
              el.style.boxShadow = "0 24px 60px rgba(249,115,22,0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0)";
              el.style.borderColor = "rgba(217,119,6,0.30)";
              el.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: "2.4rem",
              background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(249,115,22,0.15))",
              border: "2px solid rgba(245,158,11,0.3)",
            }}>{p.icon}</div>
            <div style={{ fontFamily: ff.playfair, fontSize: "1.3rem", fontWeight: 700, color: "#1C2B1A" }}>{p.name}</div>
            <div style={{ fontSize: "0.88rem", color: "#EA580C", fontWeight: 600, margin: "4px 0" }}>{p.job}</div>
            <div style={{ margin: "14px 0", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <span style={{ background: "rgba(217,119,6,0.10)", border: "1px solid rgba(217,119,6,0.25)", borderRadius: 50, padding: "4px 12px", fontSize: "0.78rem", color: "#D97706", fontFamily: ff.space, fontWeight: 700 }}>{p.from}</span>
              <span style={{ color: "#059669", fontSize: "1.1rem", animation: "vs-bridge-pulse 2s ease-in-out infinite" }}>⟶</span>
              <span style={{ background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.25)", borderRadius: 50, padding: "4px 12px", fontSize: "0.78rem", color: "#EA580C", fontFamily: ff.space, fontWeight: 700 }}>{p.to}</span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "#5A4A2A" }}>{p.origin} → {p.dest}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── S6: TECH ──
function TechSection() {
  const techs = [
    { logo: "⚡", name: "Next.js", desc: "Full-stack React framework" },
    { logo: "🤖", name: "Google ADK", desc: "Multi-agent orchestration" },
    { logo: "🌟", name: "Gemini AI", desc: "Voice & language intelligence" },
    { logo: "🔐", name: "Clerk", desc: "Auth & user management" },
    { logo: "🗄️", name: "Neon DB", desc: "Serverless Postgres" },
    { logo: "⚙️", name: "Inngest", desc: "Durable background workflows" },
  ];

  return (
    <section style={{
      width: "100%", height: "100%", background: "#F3F7F0",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 48, padding: "80px 64px", position: "relative", overflow: "hidden",
      fontFamily: ff.jakarta,
    }}>
      {/* Blueprint grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(217,119,6,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(217,119,6,0.07) 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div style={{ fontFamily: ff.space, fontSize: "0.72rem", letterSpacing: "0.15em", color: "#EA580C", textTransform: "uppercase", textAlign: "center", position: "relative", zIndex: 1 }}>
        BUILT WITH
      </div>
      <div style={{ fontFamily: ff.playfair, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 700, color: "#2A1A0A", textAlign: "center", margin: 0, position: "relative", zIndex: 1 }}>
        Enterprise-Grade AI Infrastructure
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 780 }} className="tech-grid">
          {techs.map((t, i) => (
            <div key={i}
              style={{
                background: "rgba(255,255,255,0.85)", border: "1px solid rgba(217,119,6,0.18)",
                borderRadius: 18, padding: "24px 20px", textAlign: "center",
                boxShadow: "0 4px 20px rgba(217,119,6,0.07)", transition: "all 0.4s ease",
                animation: `vs-tech-float 4s ease-in-out ${i * 0.5}s infinite`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#059669";
                el.style.boxShadow = "0 0 30px rgba(5,150,105,0.15)";
                el.style.transform = "translateY(-12px) scale(1.03)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(217,119,6,0.18)";
                el.style.boxShadow = "0 4px 20px rgba(217,119,6,0.07)";
                el.style.transform = "";
              }}
            >
              <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>{t.logo}</div>
              <div style={{ fontFamily: ff.space, fontSize: "0.78rem", color: "#D97706", letterSpacing: "0.08em", fontWeight: 700 }}>{t.name}</div>
              <div style={{ fontSize: "0.75rem", color: "#5A4A2A", marginTop: 4 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontFamily: ff.playfair, fontSize: "1.1rem", color: "#5A4A2A", textAlign: "center", fontStyle: "italic", position: "relative", zIndex: 1 }}>
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
        href="/sign-up"
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
