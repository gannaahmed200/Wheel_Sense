// SkeletonHero — MediaPipe-style pose skeleton for the hero section.
// Tracks mouse → tilts the whole skeleton. Joints pulse independently.
// Uses SVG + Framer Motion. No WebGL needed.
import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame } from 'framer-motion'

// ─── Keypoints in SVG space (400×520 viewBox) ─────────────────────────────────
// Wheelchair basketball athlete — seated, right arm extended with ball
const KP = [
  { id: 'nose',     x: 200, y: 28  },
  { id: 'lsho',     x: 148, y: 90  },
  { id: 'rsho',     x: 252, y: 90  },
  { id: 'lelb',     x: 108, y: 168 },
  { id: 'relb',     x: 292, y: 168 },
  { id: 'lwri',     x: 118, y: 242 },
  { id: 'rwri',     x: 310, y: 238 },
  { id: 'lhip',     x: 158, y: 248 },
  { id: 'rhip',     x: 242, y: 248 },
]

// Connection pairs by index
const CONN = [
  [1, 2],  // shoulder–shoulder
  [0, 1],  // head–left shoulder
  [0, 2],  // head–right shoulder
  [1, 3],  // left shoulder–left elbow
  [2, 4],  // right shoulder–right elbow
  [3, 5],  // left elbow–left wrist
  [4, 6],  // right elbow–right wrist
  [1, 7],  // left shoulder–left hip
  [2, 8],  // right shoulder–right hip
  [7, 8],  // hip–hip
]

// ─── Floating skeleton group ───────────────────────────────────────────────────
function SkeletonFigure({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<SVGGElement>(null)
  const timeRef  = useRef(0)

  useAnimationFrame((t) => {
    timeRef.current = t / 1000
    if (!groupRef.current) return
    const floatY = Math.sin(timeRef.current * 0.55) * 9
    const tiltX  = (mouseY - 0.5) * -12
    const tiltY  = (mouseX - 0.5) *  14
    groupRef.current.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${floatY}px)`
  })

  return (
    <g
      ref={groupRef}
      style={{ transformOrigin: '200px 160px', transformStyle: 'preserve-3d', transition: 'transform 0.05s' }}
    >
      {/* ── Connection bones ─────────────────────────────────────────── */}
      {CONN.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={KP[a].x} y1={KP[a].y}
          x2={KP[b].x} y2={KP[b].y}
          stroke="rgba(255,90,31,0.45)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 + i * 0.08, ease: 'easeOut' }}
        />
      ))}

      {/* ── Wheelchair frame ─────────────────────────────────────────── */}
      {/* Seat rail */}
      <motion.line x1="110" y1="262" x2="295" y2="262"
        stroke="rgba(255,90,31,0.35)" strokeWidth="3" strokeLinecap="round"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.5 }} />
      {/* Back rest */}
      <motion.line x1="110" y1="262" x2="110" y2="210"
        stroke="rgba(255,90,31,0.3)" strokeWidth="3" strokeLinecap="round"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.5 }} />
      {/* Left main wheel */}
      <motion.circle cx="140" cy="330" r="58"
        fill="none" stroke="rgba(255,90,31,0.5)" strokeWidth="5"
        style={{ filter: 'drop-shadow(0 0 8px rgba(255,90,31,0.45))' }}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5, ease: 'backOut' }} />
      <motion.circle cx="140" cy="330" r="42"
        fill="none" stroke="rgba(255,90,31,0.2)" strokeWidth="1.5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} />
      {/* Left wheel spokes */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2
        return (
          <motion.line key={i}
            x1={140} y1={330}
            x2={140 + Math.cos(a) * 42} y2={330 + Math.sin(a) * 42}
            stroke="rgba(230,200,170,0.35)" strokeWidth="1.2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.55 + i * 0.02 }}
          />
        )
      })}
      <motion.circle cx="140" cy="330" r="6" fill="rgba(255,90,31,0.8)"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.6 }} />
      {/* Right main wheel */}
      <motion.circle cx="268" cy="330" r="58"
        fill="none" stroke="rgba(255,90,31,0.5)" strokeWidth="5"
        style={{ filter: 'drop-shadow(0 0 8px rgba(255,90,31,0.45))' }}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.45, duration: 0.5, ease: 'backOut' }} />
      <motion.circle cx="268" cy="330" r="42"
        fill="none" stroke="rgba(255,90,31,0.2)" strokeWidth="1.5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.55 }} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2
        return (
          <motion.line key={i}
            x1={268} y1={330}
            x2={268 + Math.cos(a) * 42} y2={330 + Math.sin(a) * 42}
            stroke="rgba(230,200,170,0.35)" strokeWidth="1.2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 + i * 0.02 }}
          />
        )
      })}
      <motion.circle cx="268" cy="330" r="6" fill="rgba(255,90,31,0.8)"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.65 }} />
      {/* Caster */}
      <motion.circle cx="310" cy="348" r="18"
        fill="none" stroke="rgba(255,90,31,0.4)" strokeWidth="3"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.7 }} />

      {/* ── Joints (glowing spheres) ──────────────────────────────────── */}
      {KP.map((kp, i) => (
        <motion.g key={kp.id}>
          {/* Outer glow */}
          <motion.circle
            cx={kp.x} cy={kp.y} r={10}
            fill="rgba(255,90,31,0.18)"
            animate={{ r: [10, 15, 10], opacity: [0.18, 0.35, 0.18] }}
            transition={{ duration: 2 + i * 0.3, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Core joint */}
          <motion.circle
            cx={kp.x} cy={kp.y} r={5.5}
            fill="#FF5A1F"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,90,31,0.9))' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.18, 1], opacity: 1 }}
            transition={{
              scale: { duration: 2 + i * 0.22, delay: 0.3 + i * 0.1, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 0.4, delay: 0.2 + i * 0.08 },
            }}
          />
          {/* Inner bright dot */}
          <motion.circle
            cx={kp.x} cy={kp.y} r={2}
            fill="#fff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.25 + i * 0.08 }}
          />
        </motion.g>
      ))}

      {/* ── Basketball (right wrist) ──────────────────────────────────── */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5, ease: 'backOut' }}
        style={{ transformOrigin: '336px 230px' }}
      >
        <defs>
          <radialGradient id="heroball" cx="36%" cy="30%" r="65%">
            <stop offset="0%"   stopColor="#ff8c3a" />
            <stop offset="42%"  stopColor="#e05800" />
            <stop offset="78%"  stopColor="#8a2800" />
            <stop offset="100%" stopColor="#2a0800" />
          </radialGradient>
        </defs>
        <circle cx="336" cy="230" r="28" fill="url(#heroball)"
          style={{ filter: 'drop-shadow(-3px 4px 14px rgba(0,0,0,0.7)) drop-shadow(0 0 12px rgba(255,90,31,0.3))' }} />
        <line x1="308" y1="230" x2="364" y2="230" stroke="#1a0700" strokeWidth="1.6" opacity="0.9" />
        <path d="M336 202 Q349 216 349 230 Q349 244 336 258" fill="none" stroke="#1a0700" strokeWidth="1.4" opacity="0.85" />
        <path d="M336 202 Q323 216 323 230 Q323 244 336 258" fill="none" stroke="#1a0700" strokeWidth="1.4" opacity="0.85" />
        <ellipse cx="328" cy="221" rx="7" ry="4.5" fill="rgba(255,210,130,0.22)" style={{ filter: 'blur(3px)' }} />
      </motion.g>

      {/* ── Head / helmet ────────────────────────────────────────────── */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.45, ease: 'backOut' }}
        style={{ transformOrigin: '200px 28px' }}
      >
        <circle cx="200" cy="28" r="22" fill="#1e1e1e"
          style={{ filter: 'drop-shadow(-2px 4px 10px rgba(0,0,0,0.7))' }} />
        <path d="M180 33 Q200 41 220 33" fill="rgba(255,90,31,0.55)" />
        <ellipse cx="192" cy="20" rx="8" ry="5.5" fill="rgba(255,255,255,0.1)" style={{ filter: 'blur(3px)' }} />
      </motion.g>

      {/* ── Paralympic agito accent ───────────────────────────────────── */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} transition={{ delay: 1.8 }}>
        <path d="M 60 95 A 22 22 0 0 1 100 78"
          fill="none" stroke="#EF3340" strokeWidth="5" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 5px rgba(239,51,64,0.7))' }} />
        <path d="M 60 109 A 22 22 0 0 1 100 92"
          fill="none" stroke="#0085C7" strokeWidth="5" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 5px rgba(0,133,199,0.7))' }} />
        <path d="M 60 123 A 22 22 0 0 1 100 106"
          fill="none" stroke="#009F6B" strokeWidth="5" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 5px rgba(0,159,107,0.7))' }} />
      </motion.g>
    </g>
  )
}

// ─── Ambient floating particles ────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  r: 1 + Math.random() * 2.5,
  delay: Math.random() * 4,
  dur: 3 + Math.random() * 3.5,
  color: i % 3 === 0 ? '#FF5A1F' : i % 3 === 1 ? '#0085C7' : '#009F6B',
}))

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SkeletonHero() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', perspective: '900px' }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 380, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,90,31,0.1) 0%, transparent 70%)',
        filter: 'blur(24px)', pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {PARTICLES.map((p, i) => (
          <motion.circle key={i}
            cx={p.x} cy={p.y} r={p.r}
            fill={p.color} opacity={0}
            animate={{ opacity: [0, 0.7, 0], cy: [p.y, p.y - 12, p.y - 24], r: [p.r * 0.4, p.r, p.r * 0.2] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {/* Skeleton SVG */}
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          width="400" height="420"
          viewBox="0 0 400 420"
          style={{ overflow: 'visible', filter: 'drop-shadow(0 0 30px rgba(255,90,31,0.1))' }}
        >
          <SkeletonFigure mouseX={mouse.x} mouseY={mouse.y} />
        </svg>
      </div>

      {/* Corner label */}
      <motion.div
        style={{
          position: 'absolute', bottom: '8%', right: '4%',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '0.7rem', letterSpacing: '0.18em',
          color: 'rgba(255,90,31,0.45)', textTransform: 'uppercase',
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
      >
        MediaPipe BlazePose · 33 Keypoints
      </motion.div>
    </div>
  )
}
