import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// ─── Rolling Basketball ────────────────────────────────────────────────────────
function RollingBall({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="rolling-ball"
          style={{
            position: 'fixed', top: '50%', zIndex: 10001,
            width: 70, height: 70, pointerEvents: 'none',
          }}
          initial={{ x: '-12vw', y: '-50%', rotate: 0 }}
          animate={{ x: '112vw', y: '-50%', rotate: 600 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.48, ease: [0.35, 0, 0.15, 1] }}
        >
          {/* Body */}
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'radial-gradient(circle at 32% 28%, #f07828 0%, #c84800 55%, #5a1800 100%)',
            boxShadow: '-6px 8px 28px rgba(0,0,0,0.75), 0 0 24px rgba(255,90,31,0.45)',
            position: 'relative', overflow: 'hidden',
          }}>
            <svg style={{ position: 'absolute', inset: 0 }} width="70" height="70" viewBox="0 0 70 70">
              <line x1="0" y1="35" x2="70" y2="35" stroke="#1a0700" strokeWidth="4" opacity="0.85" />
              <path d="M35 0 Q52 17 52 35 Q52 53 35 70" fill="none" stroke="#1a0700" strokeWidth="3.5" opacity="0.85" />
              <path d="M35 0 Q18 17 18 35 Q18 53 35 70" fill="none" stroke="#1a0700" strokeWidth="3.5" opacity="0.85" />
            </svg>
            <div style={{ position: 'absolute', top: '12%', left: '18%', width: '30%', height: '22%', borderRadius: '50%', background: 'rgba(255,190,80,0.22)', filter: 'blur(5px)' }} />
          </div>
          {/* Orange paint trail */}
          <motion.div
            style={{
              position: 'absolute', right: '96%', top: '50%',
              height: 5, borderRadius: 3,
              background: 'linear-gradient(to left, rgba(255,90,31,0.75), transparent)',
              transform: 'translateY(-50%)',
            }}
            animate={{ width: [0, 260] }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          {/* Shadow */}
          <div style={{
            position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)',
            width: 56, height: 10, borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)', filter: 'blur(6px)',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Orange court-wipe overlay ─────────────────────────────────────────────────
function CourtWipe({ phase }: { phase: 'idle' | 'in' | 'hold' | 'out' }) {
  if (phase === 'idle') return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Main orange slab */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, background: '#FF5A1F',
          transformOrigin: 'left center',
          skewX: '-6deg',
        }}
        initial={{ scaleX: 0 }}
        animate={phase === 'out' ? { scaleX: 0, transformOrigin: 'right center' } : { scaleX: 1 }}
        transition={{
          duration: phase === 'in' ? 0.3 : 0.28,
          ease: phase === 'in' ? [0.76, 0, 0.24, 1] : [0.76, 0, 0.24, 1],
        }}
      />
      {/* Court lines on wipe */}
      {(phase === 'hold') && (
        <motion.svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}
        >
          <line x1="640" y1="0" x2="640" y2="720" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <circle cx="640" cy="360" r="110" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <rect x="80" y="120" width="190" height="480" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          <rect x="1010" y="120" width="190" height="480" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
          {/* Paralympic agito shapes */}
          <path d="M 550 320 A 55 55 0 0 1 660 275" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" strokeLinecap="round" />
          <path d="M 570 360 A 55 55 0 0 1 680 315" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" strokeLinecap="round" />
          <path d="M 590 400 A 55 55 0 0 1 700 355" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" strokeLinecap="round" />
        </motion.svg>
      )}
    </div>
  )
}

// ─── Orchestrator ──────────────────────────────────────────────────────────────
export default function PageTransition() {
  const location = useLocation()
  const isFirstRender = useRef(true)
  const [phase, setPhase] = useState<'idle' | 'in' | 'hold' | 'out'>('idle')
  const [ballActive, setBallActive] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Skip animation on initial page load
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Cancel any in-progress animation
    if (abortRef.current) abortRef.current()

    let cancelled = false
    abortRef.current = () => { cancelled = true }

    const run = async () => {
      // Phase 1: Ball starts rolling + wipe sweeps in
      setBallActive(true)
      await sleep(80)
      if (cancelled) return
      setPhase('in')
      await sleep(320)
      if (cancelled) return
      // Phase 2: Hold — new page has mounted underneath
      setPhase('hold')
      setBallActive(false)
      await sleep(160)
      if (cancelled) return
      // Phase 3: Wipe sweeps out
      setPhase('out')
      await sleep(300)
      if (cancelled) return
      setPhase('idle')
    }

    run()
    return () => { cancelled = true }
  }, [location.pathname])

  return (
    <>
      <CourtWipe phase={phase} />
      <RollingBall active={ballActive} />
    </>
  )
}

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}
