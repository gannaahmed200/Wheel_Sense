// PlayerModel3D — A detailed CSS 3D wheelchair basketball athlete.
// The model rotates around the Y-axis as the user scrolls down the page.
// WebGL is blocked in Replit's sandbox preview; CSS perspective + rotateY
// gives a convincing real-3D spin at zero GPU cost.
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  ball:    'radial-gradient(circle at 36% 30%, #ff8c3a 0%, #e05800 40%, #8a2800 72%, #2a0a00 100%)',
  ballShadow: 'rgba(255,90,31,0.45)',
  tire:    '#FF5A1F',
  rim:     '#cc4010',
  spoke:   'rgba(230,215,200,0.55)',
  frame:   '#d44814',
  body:    '#e86018',
  helmet:  '#1a1a1a',
  jersey:  '#FF5A1F',
  skin:    '#c07848',
  glow:    'rgba(255,90,31,0.25)',
}

// ─── Basketball ────────────────────────────────────────────────────────────────
function Ball({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      {/* Glow */}
      <circle cx={cx} cy={cy} r={r * 1.35} fill={`radial-gradient(circle, ${C.ballShadow} 0%, transparent 70%)`} opacity="0.6" />
      <defs>
        <radialGradient id="ballGrad" cx="36%" cy="30%" r="65%" fx="36%" fy="30%">
          <stop offset="0%"   stopColor="#ff8c3a" />
          <stop offset="38%"  stopColor="#e05800" />
          <stop offset="72%"  stopColor="#8a2800" />
          <stop offset="100%" stopColor="#2a0a00" />
        </radialGradient>
        <filter id="ballGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Body */}
      <circle cx={cx} cy={cy} r={r} fill="url(#ballGrad)"
        style={{ filter: `drop-shadow(-${r*0.18}px ${r*0.2}px ${r*0.6}px rgba(0,0,0,0.7)) drop-shadow(0 0 ${r*0.5}px rgba(255,90,31,0.3))` }} />
      {/* Seams */}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#1a0700" strokeWidth={r*0.07} opacity="0.9" />
      <path d={`M${cx} ${cy-r} Q${cx+r*0.6} ${cy-r*0.35} ${cx+r*0.6} ${cy} Q${cx+r*0.6} ${cy+r*0.35} ${cx} ${cy+r}`}
        fill="none" stroke="#1a0700" strokeWidth={r*0.065} opacity="0.85" />
      <path d={`M${cx} ${cy-r} Q${cx-r*0.6} ${cy-r*0.35} ${cx-r*0.6} ${cy} Q${cx-r*0.6} ${cy+r*0.35} ${cx} ${cy+r}`}
        fill="none" stroke="#1a0700" strokeWidth={r*0.065} opacity="0.85" />
      <path d={`M${cx-r} ${cy} Q${cx-r*0.35} ${cy-r*0.5} ${cx} ${cy} Q${cx+r*0.35} ${cy+r*0.5} ${cx+r} ${cy}`}
        fill="none" stroke="#1a0700" strokeWidth={r*0.055} opacity="0.75" />
      {/* Highlight */}
      <ellipse cx={cx - r*0.2} cy={cy - r*0.28} rx={r*0.22} ry={r*0.16}
        fill="rgba(255,220,140,0.28)" style={{ filter: 'blur(5px)' }} />
    </g>
  )
}

// ─── Wheel ─────────────────────────────────────────────────────────────────────
function Wheel({ cx, cy, r, spokeCount = 14 }: { cx: number; cy: number; r: number; spokeCount?: number }) {
  const spokes = Array.from({ length: spokeCount }, (_, i) => {
    const a = (i / spokeCount) * Math.PI * 2
    return { x: cx + Math.cos(a) * (r * 0.72), y: cy + Math.sin(a) * (r * 0.72) }
  })
  return (
    <g>
      {/* Tyre */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.tire} strokeWidth={r * 0.11}
        style={{ filter: `drop-shadow(0 0 10px ${C.ballShadow})` }} />
      {/* Rim inner */}
      <circle cx={cx} cy={cy} r={r * 0.86} fill="none" stroke={C.rim} strokeWidth={r * 0.045} opacity="0.6" />
      {/* Push rim */}
      <circle cx={cx} cy={cy} r={r * 0.72} fill="none" stroke="rgba(255,90,31,0.3)" strokeWidth={r * 0.03} />
      {/* Spokes */}
      {spokes.map((s, i) => (
        <line key={i} x1={cx} y1={cy} x2={s.x} y2={s.y} stroke={C.spoke} strokeWidth={r * 0.025} />
      ))}
      {/* Hub */}
      <circle cx={cx} cy={cy} r={r * 0.09} fill={C.tire}
        style={{ filter: `drop-shadow(0 0 6px rgba(255,90,31,0.9))` }} />
      <circle cx={cx} cy={cy} r={r * 0.045} fill={C.rim} />
    </g>
  )
}

// ─── The full athlete model ────────────────────────────────────────────────────
function AthleteModel() {
  // Canvas: 480 wide × 580 tall, player roughly centred
  const W = 480, H = 580

  // Wheel centres
  const mainWheelR = 108
  const leftWheelCx = 160, leftWheelCy = 420
  const rightWheelCx = 345, rightWheelCy = 420
  const casterR = 24
  const casterCx = 400, casterCy = 474

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" overflow="visible">
      <defs>
        {/* Body/jersey gradient — left-lit */}
        <linearGradient id="jerseyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ff7832" />
          <stop offset="55%"  stopColor="#e05010" />
          <stop offset="100%" stopColor="#7a2800" />
        </linearGradient>
        {/* Wheelchair frame gradient */}
        <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#cc4010" />
          <stop offset="100%" stopColor="#8a2a00" />
        </linearGradient>
        {/* Skin gradient */}
        <linearGradient id="skinGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor="#d4905a" />
          <stop offset="100%" stopColor="#8a5030" />
        </linearGradient>
        {/* Helmet */}
        <linearGradient id="helmetGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
        {/* Ground shadow */}
        <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.55)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* ── Ground shadow ───────────────────────────────────────────── */}
      <ellipse cx={250} cy={535} rx={185} ry={28} fill="url(#groundShadow)" />

      {/* ── Wheelchair frame ────────────────────────────────────────── */}
      {/* Main frame tubes */}
      {/* Seat rail — left */}
      <line x1={130} y1={295} x2={175} y2={415} stroke="url(#frameGrad)" strokeWidth={8} strokeLinecap="round" />
      {/* Seat rail — right */}
      <line x1={295} y1={295} x2={340} y2={415} stroke="url(#frameGrad)" strokeWidth={8} strokeLinecap="round" />
      {/* Front cross tube */}
      <line x1={175} y1={295} x2={320} y2={295} stroke="url(#frameGrad)" strokeWidth={7} strokeLinecap="round" />
      {/* Diagonal brace left */}
      <line x1={145} y1={370} x2={295} y2={295} stroke="url(#frameGrad)" strokeWidth={5} strokeLinecap="round" opacity="0.7" />
      {/* Diagonal brace right */}
      <line x1={320} y1={370} x2={175} y2={295} stroke="url(#frameGrad)" strokeWidth={5} strokeLinecap="round" opacity="0.7" />
      {/* Footrest tube */}
      <path d={`M 295 295 L 375 340 L 410 362`} stroke="url(#frameGrad)" strokeWidth={6} strokeLinecap="round" fill="none" />
      {/* Footrest plate */}
      <path d={`M 388 355 L 430 368 L 425 380 L 383 367 Z`} fill="url(#frameGrad)" opacity="0.9" />
      {/* Backrest */}
      <line x1={130} y1={295} x2={128} y2={175} stroke="url(#frameGrad)" strokeWidth={7} strokeLinecap="round" />
      <line x1={130} y1={295} x2={175} y2={175} stroke="url(#frameGrad)" strokeWidth={5} strokeLinecap="round" opacity="0.6" />
      {/* Seat cushion / platform */}
      <path d={`M 128 292 L 322 292 L 315 308 L 135 308 Z`}
        fill="url(#frameGrad)" opacity="0.8" />

      {/* ── Main wheels ─────────────────────────────────────────────── */}
      <Wheel cx={leftWheelCx}  cy={leftWheelCy}  r={mainWheelR} spokeCount={14} />
      <Wheel cx={rightWheelCx} cy={rightWheelCy} r={mainWheelR} spokeCount={14} />

      {/* ── Front caster ────────────────────────────────────────────── */}
      <line x1={casterCx} y1={365} x2={casterCx} y2={casterCy - casterR}
        stroke="url(#frameGrad)" strokeWidth={4} strokeLinecap="round" />
      <circle cx={casterCx} cy={casterCy} r={casterR}
        fill="none" stroke={C.tire} strokeWidth={6}
        style={{ filter: `drop-shadow(0 0 4px ${C.ballShadow})` }} />
      <circle cx={casterCx} cy={casterCy} r={6} fill={C.tire} />

      {/* ── Athlete body ────────────────────────────────────────────── */}
      {/* Legs (in seat) */}
      <path d={`M 175 300 Q 200 305 240 310 Q 290 312 320 302`}
        stroke="url(#jerseyGrad)" strokeWidth={22} strokeLinecap="round" fill="none" />
      {/* Torso — leaning forward */}
      <path d={`M 152 290 Q 165 240 190 200 Q 210 165 240 155 L 265 162 Q 240 172 222 210 Q 200 255 192 295 Z`}
        fill="url(#jerseyGrad)"
        style={{ filter: 'drop-shadow(-4px 4px 12px rgba(0,0,0,0.5))' }} />
      {/* Jersey number block */}
      <text x="173" y="245" fill="rgba(255,255,255,0.55)" fontSize="22" fontWeight="900"
        fontFamily="Bebas Neue, sans-serif" letterSpacing="2">4</text>
      {/* Right shoulder / arm — upper arm raised outward */}
      <path d={`M 265 165 Q 310 125 350 115`}
        stroke="url(#jerseyGrad)" strokeWidth={20} strokeLinecap="round" fill="none" />
      {/* Forearm — bent upward in shooting form */}
      <path d={`M 350 115 Q 385 105 425 125`}
        stroke="url(#skinGrad)" strokeWidth={16} strokeLinecap="round" fill="none" />
      {/* Left arm — pushing wheel */}
      <path d={`M 152 268 Q 138 290 140 320 Q 142 345 155 368`}
        stroke="url(#jerseyGrad)" strokeWidth={18} strokeLinecap="round" fill="none" />
      <path d={`M 155 368 Q 148 388 142 400`}
        stroke="url(#skinGrad)" strokeWidth={15} strokeLinecap="round" fill="none" />
      {/* Left hand on wheel */}
      <circle cx={140} cy={405} r={11} fill="url(#skinGrad)"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />

      {/* ── Head & Helmet ────────────────────────────────────────────── */}
      {/* Neck */}
      <path d={`M 218 162 Q 228 148 238 140`}
        stroke="url(#skinGrad)" strokeWidth={14} strokeLinecap="round" fill="none" />
      {/* Head */}
      <circle cx={248} cy={118} r={40} fill="url(#helmetGrad)"
        style={{ filter: 'drop-shadow(-3px 5px 14px rgba(0,0,0,0.7))' }} />
      {/* Helmet highlight */}
      <ellipse cx={232} cy={100} rx={14} ry={9}
        fill="rgba(255,255,255,0.12)" style={{ filter: 'blur(4px)' }} />
      {/* Visor */}
      <path d={`M 212 122 Q 228 130 248 128 Q 268 126 282 118`}
        fill="rgba(255,90,31,0.5)"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(255,90,31,0.5))' }} />
      {/* Visor glare */}
      <path d={`M 215 123 Q 225 129 238 127`}
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
      {/* Face area */}
      <path d={`M 214 128 Q 230 148 248 150 Q 265 148 280 128`}
        fill="url(#skinGrad)" opacity="0.85" />
      {/* Eye slit */}
      <line x1={232} y1={126} x2={272} y2={122} stroke="rgba(0,0,0,0.4)" strokeWidth={3} strokeLinecap="round" />

      {/* ── Basketball (held on right) ────────────────────────────────── */}
      <Ball cx={465} cy={120} r={46} />
      {/* Hand gripping ball */}
      <circle cx={438} cy={140} r={10} fill="url(#skinGrad)"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />

      {/* ── Paralympic agito accent (shoulder/back) ──────────────────── */}
      <g opacity="0.65" style={{ filter: 'drop-shadow(0 0 5px rgba(239,51,64,0.4))' }}>
        <path d={`M 128 175 A 22 22 0 0 1 172 155`}
          fill="none" stroke="#EF3340" strokeWidth={5} strokeLinecap="round" />
        <path d={`M 128 188 A 22 22 0 0 1 172 168`}
          fill="none" stroke="#0085C7" strokeWidth={5} strokeLinecap="round" />
        <path d={`M 128 201 A 22 22 0 0 1 172 181`}
          fill="none" stroke="#009F6B" strokeWidth={5} strokeLinecap="round" />
      </g>

      {/* ── Subtle ambient shadow beneath seat ──────────────────────── */}
      <ellipse cx={230} cy={310} rx={105} ry={14}
        fill="rgba(0,0,0,0.25)" style={{ filter: 'blur(8px)' }} />
    </svg>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────
export default function PlayerModel3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll-driven Y-axis rotation
  const { scrollY } = useScroll()
  // As user scrolls 0→600px, model rotates -12°→+200° (full spin + a bit)
  const rotateY = useTransform(scrollY, [0, 700], [-12, 220])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        // Perspective makes the CSS rotateY look truly 3-dimensional
        perspective: '1100px',
        perspectiveOrigin: '50% 48%',
      }}
    >
      {/* Ambient glow behind model */}
      <div style={{
        position: 'absolute',
        width: 420, height: 480,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,90,31,0.12) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      {/* The rotating 3D model */}
      <motion.div
        style={{
          rotateY,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          filter: 'drop-shadow(-20px 24px 50px rgba(0,0,0,0.8))',
        }}
      >
        <AthleteModel />
      </motion.div>
    </div>
  )
}
