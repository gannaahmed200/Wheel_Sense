import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Spinning mini basketball logo ────────────────────────────────────────────
function SpinningBall() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      style={{ width: 28, height: 28, position: 'relative', flexShrink: 0 }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'radial-gradient(circle at 36% 30%, #ff8c3a 0%, #e05800 50%, #6a2000 100%)',
        boxShadow: '-2px 3px 8px rgba(0,0,0,0.6), inset -2px -2px 5px rgba(0,0,0,0.3)',
        position: 'relative', overflow: 'hidden',
      }}>
        <svg style={{ position: 'absolute', inset: 0 }} width="28" height="28" viewBox="0 0 28 28">
          <line x1="0" y1="14" x2="28" y2="14" stroke="#1a0700" strokeWidth="1.8" opacity="0.9" />
          <path d="M14 0 Q20 7 20 14 Q20 21 14 28" fill="none" stroke="#1a0700" strokeWidth="1.5" opacity="0.9" />
          <path d="M14 0 Q8 7 8 14 Q8 21 14 28" fill="none" stroke="#1a0700" strokeWidth="1.5" opacity="0.9" />
        </svg>
        <div style={{ position: 'absolute', top: '15%', left: '20%', width: '28%', height: '22%', borderRadius: '50%', background: 'rgba(255,200,100,0.3)', filter: 'blur(3px)' }} />
      </div>
    </motion.div>
  )
}

// ─── Wheelchair icon in logo ──────────────────────────────────────────────────
function WheelchairLogoMark() {
  return (
    <div style={{
      width: 36, height: 36, background: '#FF5A1F', borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 10px rgba(255,90,31,0.45)',
    }}>
      {/* Custom wheelchair + ball SVG */}
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        {/* Head */}
        <circle cx="14" cy="3.5" r="2.2" fill="white" />
        {/* Body */}
        <path d="M14 5.7 L14 9.5 L11 12" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        {/* Throwing arm */}
        <path d="M14 7.5 L18 5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        {/* Basketball */}
        <circle cx="20" cy="4" r="2.5" stroke="white" strokeWidth="1.3" fill="none" />
        <line x1="17.5" y1="4" x2="22.5" y2="4" stroke="white" strokeWidth="0.8" opacity="0.7" />
        {/* Seat */}
        <path d="M14 9.5 L16 12.5 L11 12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Wheel */}
        <circle cx="11" cy="16.5" r="4.5" stroke="white" strokeWidth="1.6" />
        <circle cx="11" cy="16.5" r="1.2" fill="white" opacity="0.8" />
        <line x1="11" y1="12" x2="11" y2="14" stroke="white" strokeWidth="1.1" />
        <line x1="11" y1="19" x2="11" y2="21" stroke="white" strokeWidth="1.1" />
        <line x1="6.5" y1="16.5" x2="8.5" y2="16.5" stroke="white" strokeWidth="1.1" />
        <line x1="13.5" y1="16.5" x2="15.5" y2="16.5" stroke="white" strokeWidth="1.1" />
        {/* Front caster */}
        <circle cx="17" cy="19.5" r="1.4" stroke="white" strokeWidth="1.3" />
      </svg>
    </div>
  )
}

// ─── Paralympic agito accent ──────────────────────────────────────────────────
function AgitoAccent({ compact = false }: { compact?: boolean }) {
  const s = compact ? 0.6 : 1
  return (
    <svg width={42 * s} height={26 * s} viewBox="0 0 42 26">
      <path d="M 3 13 A 11 11 0 0 1 26 4"
        fill="none" stroke="#EF3340" strokeWidth={4.5 * s} strokeLinecap="round"
        style={{ filter: compact ? 'none' : 'drop-shadow(0 0 3px rgba(239,51,64,0.7))' }} />
      <path d="M 9 20 A 11 11 0 0 1 32 11"
        fill="none" stroke="#0085C7" strokeWidth={4.5 * s} strokeLinecap="round"
        style={{ filter: compact ? 'none' : 'drop-shadow(0 0 3px rgba(0,133,199,0.7))' }} />
      <path d="M 15 26 A 11 11 0 0 1 38 17"
        fill="none" stroke="#009F6B" strokeWidth={4.5 * s} strokeLinecap="round"
        style={{ filter: compact ? 'none' : 'drop-shadow(0 0 3px rgba(0,159,107,0.7))' }} />
    </svg>
  )
}

// ─── Nav link with court-line themed indicator ────────────────────────────────
const NAV_ICONS: Record<string, React.ReactNode> = {
  '/': (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 6 Q4 4 6 6 Q8 8 10 6" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  ),
  '/configure': (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="6.5" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="6.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="6.5" y="6.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  '/dashboard': (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 9 L3.5 5.5 L5.5 7 L8 3.5 L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="3.5" r="1.5" fill="currentColor" opacity="0.7" />
    </svg>
  ),
  '/history': (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 3 L6 6.5 L8.5 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const links = [
  { path: '/', label: 'Home' },
  { path: '/configure', label: 'Analyze' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/history', label: 'History' },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(8,8,8,0.97)' : 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,90,31,0.15)',
      transition: 'background 0.3s',
    }}>

      {/* Court line accent at very top */}
      <div style={{
        height: 2, background: 'linear-gradient(to right, #EF3340, #FF5A1F 40%, #0085C7 70%, #009F6B)',
        opacity: scrolled ? 1 : 0.6, transition: 'opacity 0.3s',
      }} />

      <div style={{
        maxWidth: '82rem', margin: '0 auto', padding: '0 1.5rem',
        height: '3.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <WheelchairLogoMark />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '0.15em', color: '#fff', lineHeight: 1 }}>
              WHEEL
            </span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '0.15em', color: '#FF5A1F', lineHeight: 1 }}>
              TRACK
            </span>
          </div>
          {/* Paralympic agitos */}
          <div style={{ opacity: 0.85 }}>
            <AgitoAccent compact />
          </div>
        </Link>

        {/* ── Nav links ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
          {links.map(({ path, label }) => {
            const isActive = location.pathname === path
            return (
              <Link key={path} to={path} style={{ position: 'relative', padding: '0.45rem 0.9rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                {/* Active pill background */}
                {isActive && (
                  <motion.div
                    layoutId="navPill"
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '9999px',
                      background: '#FF5A1F',
                      boxShadow: '0 0 16px rgba(255,90,31,0.4)',
                    }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                {/* Icon + label */}
                <span style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '0.82rem', fontWeight: 700,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: isActive ? '#fff' : '#888880',
                  transition: 'color 0.2s',
                }}>
                  <span style={{ color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(136,136,128,0.7)' }}>
                    {NAV_ICONS[path]}
                  </span>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* ── Right: Live + Spinning ball ───────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Live indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0.7rem', borderRadius: '9999px',
            border: '1px solid rgba(255,90,31,0.3)',
            background: 'rgba(255,90,31,0.08)',
          }}>
            <motion.div
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5A1F' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', color: '#FF5A1F' }}>
              LIVE
            </span>
          </div>
          {/* Mini spinning ball */}
          <SpinningBall />
        </div>
      </div>

      {/* Scrolled glow line */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            key="glow-line"
            style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,90,31,0.6), transparent)' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>
    </nav>
  )
}
