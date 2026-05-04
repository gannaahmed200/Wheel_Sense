import { useMemo } from 'react'
import { motion } from 'framer-motion'

// ─── Sizes ────────────────────────────────────────────────────────────────────
const BALL_SIZE = 360

// ─── Realistic CSS Basketball ─────────────────────────────────────────────────
function BigBasketball() {
  return (
    <motion.div
      style={{ width: BALL_SIZE, height: BALL_SIZE, position: 'relative' }}
      animate={{ rotateY: 360 }}
      transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
    >
      {/* Outer glow rings */}
      <motion.div style={{
        position: 'absolute', inset: -30, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,90,31,0.22) 0%, transparent 70%)',
      }} animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} />

      {/* Ball */}
      <div style={{
        width: BALL_SIZE, height: BALL_SIZE, borderRadius: '50%',
        background: `
          radial-gradient(circle at 38% 32%,
            #ff8c3a 0%,
            #e86010 22%,
            #c44800 45%,
            #8a2800 68%,
            #3d0e00 88%,
            #1a0500 100%)
        `,
        boxShadow: `
          -22px 22px 80px rgba(0,0,0,0.85),
          -8px  8px  30px rgba(0,0,0,0.6),
          inset -18px -18px 45px rgba(0,0,0,0.5),
          inset  8px  8px  25px rgba(255,160,60,0.28),
          0 0 60px rgba(255,90,31,0.18)
        `,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Seam SVG */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
          {/* Horizontal seam */}
          <path d="M -2 50 Q 25 36 50 50 Q 75 64 102 50"
            fill="none" stroke="#1a0700" strokeWidth="2.2" opacity="0.9" />
          {/* Left vertical curve */}
          <path d="M 50 -2 Q 36 25 50 50 Q 64 75 50 102"
            fill="none" stroke="#1a0700" strokeWidth="2.2" opacity="0.9" />
          {/* Right vertical curve */}
          <path d="M 50 -2 Q 68 20 72 50 Q 68 80 50 102"
            fill="none" stroke="#1a0700" strokeWidth="1.6" opacity="0.7" />
          {/* Left alt curve */}
          <path d="M 50 -2 Q 32 20 28 50 Q 32 80 50 102"
            fill="none" stroke="#1a0700" strokeWidth="1.6" opacity="0.7" />
        </svg>

        {/* Main highlight blob */}
        <div style={{
          position: 'absolute', top: '12%', left: '16%',
          width: '36%', height: '28%', borderRadius: '50%',
          background: 'rgba(255,210,130,0.28)', filter: 'blur(14px)',
        }} />
        {/* Small secondary highlight */}
        <div style={{
          position: 'absolute', top: '18%', left: '22%',
          width: '14%', height: '12%', borderRadius: '50%',
          background: 'rgba(255,240,200,0.35)', filter: 'blur(5px)',
        }} />
        {/* Shadow at bottom of ball */}
        <div style={{
          position: 'absolute', bottom: '4%', left: '20%', right: '20%',
          height: '18%', borderRadius: '50%',
          background: 'rgba(0,0,0,0.35)', filter: 'blur(10px)',
        }} />
      </div>

      {/* Cast shadow on floor */}
      <motion.div style={{
        position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)',
        width: BALL_SIZE * 0.85, height: 28, borderRadius: '50%',
        background: 'rgba(0,0,0,0.4)', filter: 'blur(18px)',
      }} animate={{ scaleX: [1, 0.95, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} />
    </motion.div>
  )
}

// ─── Wheelchair Basketball Athlete Silhouette ─────────────────────────────────
function AthleteSilhouette() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 1.2 }}
      style={{ position: 'relative' }}
    >
      <svg width="300" height="210" viewBox="0 0 300 210" fill="none">
        {/* Court floor line */}
        <line x1="10" y1="195" x2="290" y2="195" stroke="rgba(255,90,31,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Wheelchair frame — seat */}
        <path d="M 100 120 L 185 120 L 185 150 L 100 150 Z"
          fill="none" stroke="rgba(255,90,31,0.7)" strokeWidth="3" strokeLinejoin="round" />
        {/* Back rest */}
        <line x1="100" y1="120" x2="100" y2="85" stroke="rgba(255,90,31,0.7)" strokeWidth="3" strokeLinecap="round" />
        {/* Foot rest */}
        <path d="M 185 150 L 215 165" stroke="rgba(255,90,31,0.6)" strokeWidth="3" strokeLinecap="round" />
        <line x1="205" y1="168" x2="225" y2="168" stroke="rgba(255,90,31,0.5)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Main wheel (large) */}
        <circle cx="135" cy="172" r="36" fill="none" stroke="#FF5A1F" strokeWidth="4"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,90,31,0.6))' }} />
        <circle cx="135" cy="172" r="27" fill="none" stroke="rgba(255,90,31,0.35)" strokeWidth="2" />
        {/* Main wheel spokes */}
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2
          return (
            <line key={i}
              x1={135} y1={172}
              x2={135 + Math.cos(a) * 27} y2={172 + Math.sin(a) * 27}
              stroke="rgba(255,90,31,0.5)" strokeWidth="1.5" />
          )
        })}
        <circle cx="135" cy="172" r="5" fill="#FF5A1F" />

        {/* Front small caster */}
        <circle cx="210" cy="183" r="12" fill="none" stroke="rgba(255,90,31,0.5)" strokeWidth="2.5" />
        <circle cx="210" cy="183" r="2.5" fill="rgba(255,90,31,0.6)" />

        {/* Athlete body */}
        {/* Torso (leaning forward) */}
        <path d="M 100 85 Q 118 70 140 65 L 148 100 Q 130 108 110 115 Z"
          fill="rgba(255,90,31,0.5)" />
        {/* Head */}
        <circle cx="152" cy="54" r="18" fill="rgba(255,90,31,0.55)" />
        {/* Helmet visor */}
        <path d="M 138 50 Q 152 42 166 50" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

        {/* Arm reaching/throwing */}
        <path d="M 148 75 Q 175 55 200 42" stroke="rgba(255,90,31,0.7)" strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Hand */}
        <circle cx="203" cy="40" r="7" fill="rgba(255,90,31,0.55)" />

        {/* Basketball being thrown */}
        <circle cx="228" cy="28" r="16" fill="rgba(232,90,0,0.6)"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,90,31,0.5))' }} />
        <path d="M 218 24 Q 228 28 238 24" fill="none" stroke="#1a0700" strokeWidth="1.5" opacity="0.7" />
        <path d="M 228 14 Q 233 21 228 28 Q 223 35 228 42" fill="none" stroke="#1a0700" strokeWidth="1.5" opacity="0.7" />
        {/* Ball motion lines */}
        <path d="M 248 18 Q 260 12 268 15" stroke="rgba(255,90,31,0.4)" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 244 28 Q 258 24 266 27" stroke="rgba(255,90,31,0.3)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Push hand on wheel */}
        <path d="M 118 108 Q 108 130 118 145" stroke="rgba(255,90,31,0.6)" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* Classification badge */}
        <rect x="60" y="60" width="30" height="16" rx="4" fill="rgba(255,90,31,0.2)" stroke="rgba(255,90,31,0.5)" strokeWidth="1" />
        <text x="75" y="72" textAnchor="middle" fill="#FF5A1F" fontSize="8" fontFamily="Barlow Condensed, sans-serif" fontWeight="700">CLASS</text>

        {/* Speed lines behind athlete */}
        <line x1="30" y1="100" x2="82" y2="100" stroke="rgba(255,90,31,0.15)" strokeWidth="2" strokeDasharray="3 4" />
        <line x1="20" y1="115" x2="75" y2="115" stroke="rgba(255,90,31,0.1)" strokeWidth="1.5" strokeDasharray="3 5" />
        <line x1="35" y1="130" x2="80" y2="130" stroke="rgba(255,90,31,0.08)" strokeWidth="1" strokeDasharray="3 6" />
      </svg>
    </motion.div>
  )
}

// ─── Wheelchair Wheel (side) ───────────────────────────────────────────────────
function WheelchairWheel({ size, speed = 1, opacity = 1 }: { size: number; speed?: number; opacity?: number }) {
  const spokes = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2
    return { x: 50 + Math.cos(a) * 35, y: 50 + Math.sin(a) * 35 }
  })
  return (
    <motion.div
      style={{ width: size, height: size, opacity }}
      animate={{ rotate: 360 }}
      transition={{ duration: 4 / speed, repeat: Infinity, ease: 'linear' }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="47" fill="none" stroke="#FF5A1F" strokeWidth="5.5"
          style={{ filter: 'drop-shadow(0 0 7px rgba(255,90,31,0.65))' }} />
        <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,90,31,0.5)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,90,31,0.2)" strokeWidth="1.5" />
        {spokes.map((s, i) => (
          <line key={i} x1="50" y1="50" x2={s.x} y2={s.y}
            stroke="rgba(220,210,200,0.5)" strokeWidth="1.3" />
        ))}
        <circle cx="50" cy="50" r="7" fill="#FF5A1F"
          style={{ filter: 'drop-shadow(0 0 5px rgba(255,90,31,0.9))' }} />
        <circle cx="50" cy="50" r="3.5" fill="#cc4010" />
      </svg>
    </motion.div>
  )
}

// ─── Paralympic Agitos ─────────────────────────────────────────────────────────
function ParalympicAgitos() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      <svg width="170" height="95" viewBox="0 0 170 95">
        {/* Red */}
        <path d="M 20 50 A 38 38 0 0 1 96 15"
          fill="none" stroke="#EF3340" strokeWidth="13" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(239,51,64,0.8))' }} />
        {/* Blue */}
        <path d="M 44 74 A 38 38 0 0 1 120 39"
          fill="none" stroke="#0085C7" strokeWidth="13" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,133,199,0.8))' }} />
        {/* Green */}
        <path d="M 68 94 A 38 38 0 0 1 144 59"
          fill="none" stroke="#009F6B" strokeWidth="13" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,159,107,0.8))' }} />
      </svg>
    </motion.div>
  )
}

// ─── Floating orange particles ─────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 28 }, () => ({
  x: Math.random() * 100,
  y: 15 + Math.random() * 75,
  size: 1.5 + Math.random() * 3.5,
  delay: Math.random() * 5,
  dur: 2.8 + Math.random() * 3,
}))

function Particles() {
  return (
    <>
      {PARTICLES.map((p, i) => (
        <motion.div key={i} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: i % 3 === 0 ? '#FF5A1F' : i % 3 === 1 ? '#0085C7' : '#009F6B',
          opacity: 0, pointerEvents: 'none',
        }}
          animate={{ opacity: [0, 0.75, 0], y: [0, -40, -80], scale: [0.4, 1, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

// ─── Court Floor (perspective) ────────────────────────────────────────────────
function CourtFloor() {
  return (
    <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '55%', opacity: 0.09 }}
      viewBox="0 0 1200 380" preserveAspectRatio="xMidYMax slice">
      {/* Perspective floor lines */}
      {Array.from({ length: 10 }, (_, i) => {
        const y = 30 + i * 35
        const xOff = i * 18
        return (
          <line key={i} x1={xOff} y1={y} x2={1200 - xOff} y2={y}
            stroke="#FF5A1F" strokeWidth={0.8 + i * 0.15} opacity={0.4 + i * 0.06} />
        )
      })}
      {/* Vanishing point lines */}
      {Array.from({ length: 14 }, (_, i) => {
        const x = (i / 13) * 1200
        return (
          <line key={i} x1="600" y1="0" x2={x} y2="380"
            stroke="#FF5A1F" strokeWidth="0.7" opacity="0.3" />
        )
      })}
      {/* Center circle on floor */}
      <ellipse cx="600" cy="380" rx="250" ry="60"
        fill="none" stroke="#FF5A1F" strokeWidth="1.5" opacity="0.5" />
      {/* Free throw arcs */}
      <path d="M 200 380 Q 350 200 500 380" fill="none" stroke="#FF5A1F" strokeWidth="1.2" opacity="0.4" />
      <path d="M 700 380 Q 850 200 1000 380" fill="none" stroke="#FF5A1F" strokeWidth="1.2" opacity="0.4" />
    </svg>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HeroScene3D() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Ambient particles */}
      <Particles />

      {/* Court floor perspective grid */}
      <CourtFloor />

      {/* ── RIGHT SIDE: Main basketball ────────────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute', right: '-2%', top: '50%',
          transform: 'translateY(-56%)',
          filter: 'drop-shadow(0 0 50px rgba(255,90,31,0.3))',
        }}
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0, y: [0, -18, 0] }}
        transition={{
          opacity: { duration: 0.9 },
          x: { duration: 0.9 },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
        }}
      >
        <BigBasketball />
      </motion.div>

      {/* ── RIGHT SIDE: Wheelchair athlete below ball ───────────────────── */}
      <motion.div
        style={{
          position: 'absolute', right: '12%', bottom: '8%',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 1, delay: 1.4 }}
      >
        <AthleteSilhouette />
      </motion.div>

      {/* ── LEFT: Wheelchair wheel — large, far left ────────────────────── */}
      <motion.div
        style={{ position: 'absolute', left: '-6%', top: '50%', transform: 'translateY(-50%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55, x: [0, 6, 0] }}
        transition={{ opacity: { duration: 1.2, delay: 0.4 }, x: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <WheelchairWheel size={230} speed={0.9} />
      </motion.div>

      {/* ── TOP RIGHT: Second wheel (above basketball) ──────────────────── */}
      <motion.div
        style={{ position: 'absolute', right: '28%', top: '8%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3, y: [0, -5, 0] }}
        transition={{ opacity: { duration: 1, delay: 0.8 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <WheelchairWheel size={110} speed={1.2} />
      </motion.div>

      {/* ── Paralympic agitos — upper left ──────────────────────────────── */}
      <motion.div
        style={{ position: 'absolute', top: '14%', left: '18%' }}
      >
        <ParalympicAgitos />
      </motion.div>

      {/* ── Floating mini balls ──────────────────────────────────────────── */}
      {[
        { left: '40%', top: '18%', size: 52, delay: 0.9, dur: 3.8 },
        { left: '55%', top: '72%', size: 38, delay: 1.4, dur: 4.2 },
      ].map((b, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', left: b.left, top: b.top,
            width: b.size, height: b.size, borderRadius: '50%',
            background: 'radial-gradient(circle at 36% 30%, #f07020 0%, #c04800 55%, #3d0e00 100%)',
            boxShadow: '-4px 5px 16px rgba(0,0,0,0.7), inset -3px -3px 8px rgba(0,0,0,0.35)',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.6], y: [0, -12, 0] }}
          transition={{ opacity: { duration: 0.6, delay: b.delay }, y: { duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: b.delay } }}
        >
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
            <line x1="0" y1="50" x2="100" y2="50" stroke="#1a0700" strokeWidth="5" opacity="0.85" />
            <path d="M50 -5 Q72 22 72 50 Q72 78 50 105" fill="none" stroke="#1a0700" strokeWidth="4" opacity="0.85" />
            <path d="M50 -5 Q28 22 28 50 Q28 78 50 105" fill="none" stroke="#1a0700" strokeWidth="4" opacity="0.85" />
          </svg>
        </motion.div>
      ))}

      {/* ── Scan lines (tech feel) ───────────────────────────────────────── */}
      <motion.div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
      }} />
    </div>
  )
}
