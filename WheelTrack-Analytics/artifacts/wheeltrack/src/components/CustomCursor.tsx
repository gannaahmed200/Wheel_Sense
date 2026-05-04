import { useEffect, useRef, useState } from 'react'

// ─── Basketball SVG cursor ─────────────────────────────────────────────────────
function BasketballCursor() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cball" cx="36%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#ff8c3a" />
          <stop offset="40%"  stopColor="#e05800" />
          <stop offset="75%"  stopColor="#8a2800" />
          <stop offset="100%" stopColor="#2a0a00" />
        </radialGradient>
        <filter id="cballGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Glow ring */}
      <circle cx="19" cy="19" r="18" fill="rgba(255,90,31,0.18)" />
      {/* Ball */}
      <circle cx="19" cy="19" r="14" fill="url(#cball)"
        filter="url(#cballGlow)"
        style={{ filter: 'drop-shadow(-2px 3px 6px rgba(0,0,0,0.7))' }} />
      {/* Seams */}
      <line x1="5" y1="19" x2="33" y2="19" stroke="#1a0700" strokeWidth="1.5" opacity="0.9" />
      <path d="M19 5 Q26 12 26 19 Q26 26 19 33" fill="none" stroke="#1a0700" strokeWidth="1.3" opacity="0.9" />
      <path d="M19 5 Q12 12 12 19 Q12 26 19 33" fill="none" stroke="#1a0700" strokeWidth="1.3" opacity="0.9" />
      <path d="M5 19 Q12 14 19 19 Q26 24 33 19" fill="none" stroke="#1a0700" strokeWidth="1.2" opacity="0.8" />
      {/* Highlight */}
      <ellipse cx="14" cy="13" rx="4" ry="2.5" fill="rgba(255,220,140,0.28)" />
    </svg>
  )
}

// ─── Wheelchair athlete SVG cursor ─────────────────────────────────────────────
function WheelchairCursor() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cwglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(255,90,31,0.3)" />
          <stop offset="100%" stopColor="rgba(255,90,31,0)" />
        </radialGradient>
      </defs>
      {/* Ambient glow */}
      <circle cx="22" cy="22" r="21" fill="url(#cwglow)" />

      {/* ── Wheelchair ── */}
      {/* Main wheel */}
      <circle cx="16" cy="33" r="9" fill="none" stroke="#FF5A1F" strokeWidth="2.2"
        style={{ filter: 'drop-shadow(0 0 4px rgba(255,90,31,0.7))' }} />
      <circle cx="16" cy="33" r="6.5" fill="none" stroke="rgba(255,90,31,0.35)" strokeWidth="1" />
      {/* Spokes */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <line key={i}
            x1={16} y1={33}
            x2={16 + Math.cos(a) * 6.5} y2={33 + Math.sin(a) * 6.5}
            stroke="rgba(230,210,190,0.55)" strokeWidth="0.9" />
        )
      })}
      <circle cx="16" cy="33" r="1.6" fill="#FF5A1F" />

      {/* Front caster */}
      <circle cx="32" cy="37" r="3.5" fill="none" stroke="rgba(255,90,31,0.6)" strokeWidth="1.5" />
      <circle cx="32" cy="37" r="0.9" fill="rgba(255,90,31,0.6)" />

      {/* Seat frame */}
      <line x1="10" y1="24" x2="30" y2="24" stroke="#cc4010" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="10" y1="24" x2="10" y2="16" stroke="#cc4010" strokeWidth="1.8" strokeLinecap="round" />
      {/* Seat to caster link */}
      <line x1="30" y1="24" x2="33" y2="33" stroke="#cc4010" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── Athlete ── */}
      {/* Head */}
      <circle cx="12" cy="10" r="4.5" fill="#2a2a2a"
        style={{ filter: 'drop-shadow(-1px 2px 4px rgba(0,0,0,0.7))' }} />
      {/* Visor */}
      <path d="M8.5 11.5 Q12 13.5 15.5 11.5" fill="rgba(255,90,31,0.6)" />
      {/* Torso leaning forward */}
      <path d="M10 14 Q14 12 18 13 L17 22 Q13 23 10 22 Z" fill="#FF5A1F"
        style={{ filter: 'drop-shadow(-1px 2px 5px rgba(0,0,0,0.5))' }} />
      {/* Arm reaching for ball */}
      <path d="M18 15 Q24 12 29 10" stroke="#FF5A1F" strokeWidth="2.8" strokeLinecap="round" />
      {/* Hand */}
      <circle cx="30" cy="9.5" r="2" fill="rgba(192,120,72,0.9)" />
      {/* Left arm on wheel */}
      <path d="M10 20 Q8 26 9 30" stroke="#FF5A1F" strokeWidth="2.4" strokeLinecap="round" />

      {/* ── Mini basketball ── */}
      <circle cx="34" cy="8" r="5" fill="url(#cball)"
        style={{ filter: 'drop-shadow(-1px 2px 4px rgba(0,0,0,0.6))' }} />
      <line x1="29" y1="8" x2="39" y2="8" stroke="#1a0700" strokeWidth="1.1" opacity="0.9" />
      <path d="M34 3 Q37 5.5 37 8 Q37 10.5 34 13" fill="none" stroke="#1a0700" strokeWidth="1" opacity="0.85" />
      <path d="M34 3 Q31 5.5 31 8 Q31 10.5 34 13" fill="none" stroke="#1a0700" strokeWidth="1" opacity="0.85" />

      {/* Paralympic agito micro-badge */}
      <path d="M7 12 A4 4 0 0 1 13 9"
        fill="none" stroke="#EF3340" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <path d="M7 13.5 A4 4 0 0 1 13 10.5"
        fill="none" stroke="#0085C7" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

// ─── Main cursor component ──────────────────────────────────────────────────────
export default function CustomCursor() {
  const posRef   = useRef({ x: -100, y: -100 })
  const trailRef = useRef({ x: -100, y: -100 })
  const rafRef   = useRef<number>(0)

  const cursorEl = useRef<HTMLDivElement>(null)
  const trailEl  = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<'ball' | 'wheelchair'>('ball')

  useEffect(() => {
    // Smooth RAF loop
    const tick = () => {
      const lx = trailRef.current.x + (posRef.current.x - trailRef.current.x) * 0.14
      const ly = trailRef.current.y + (posRef.current.y - trailRef.current.y) * 0.14
      trailRef.current = { x: lx, y: ly }

      if (cursorEl.current) {
        cursorEl.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`
      }
      if (trailEl.current) {
        trailEl.current.style.transform = `translate(${lx}px, ${ly}px) translate(-50%, -50%)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }

      // Detect hover target
      const el = e.target as Element | null
      if (!el) return
      const interactive = el.closest('a, button, [role="button"], [data-cursor]')
      if (interactive) {
        const dc = interactive.getAttribute('data-cursor')
        setMode(dc === 'ball' ? 'ball' : 'wheelchair')
      } else {
        setMode('ball')
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      {/* Lagging glow trail */}
      <div
        ref={trailEl}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: mode === 'wheelchair' ? 52 : 44,
          height: mode === 'wheelchair' ? 52 : 44,
          borderRadius: '50%',
          border: `1.5px solid ${mode === 'wheelchair' ? 'rgba(255,90,31,0.55)' : 'rgba(255,90,31,0.35)'}`,
          pointerEvents: 'none', zIndex: 99997,
          transition: 'width 0.25s, height 0.25s, border-color 0.25s',
          willChange: 'transform',
        }}
      />

      {/* Main cursor icon */}
      <div
        ref={cursorEl}
        style={{
          position: 'fixed', top: 0, left: 0,
          pointerEvents: 'none', zIndex: 99999,
          willChange: 'transform',
          transition: 'opacity 0.15s',
        }}
      >
        {mode === 'ball' ? <BasketballCursor /> : <WheelchairCursor />}
      </div>
    </>
  )
}
