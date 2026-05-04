import { motion, AnimatePresence } from 'framer-motion'

const CLASS_THEME: Record<string, { color: string; glow: string; ring: string; label: string; bg: string }> = {
  efficient:   { color: '#22c55e', glow: 'rgba(34,197,94,0.35)',  ring: 'rgba(34,197,94,0.25)',  label: 'EFFICIENT',   bg: 'radial-gradient(circle at 40% 35%, #4ade80, #16a34a 50%, #052e16 100%)' },
  inefficient: { color: '#eab308', glow: 'rgba(234,179,8,0.35)',  ring: 'rgba(234,179,8,0.25)',  label: 'INEFFICIENT', bg: 'radial-gradient(circle at 40% 35%, #fde047, #ca8a04 50%, #422006 100%)' },
  danger:      { color: '#ef4444', glow: 'rgba(239,68,68,0.5)',   ring: 'rgba(239,68,68,0.35)',  label: 'DANGER',      bg: 'radial-gradient(circle at 40% 35%, #f87171, #dc2626 50%, #450a0a 100%)' },
  complete:    { color: '#3b82f6', glow: 'rgba(59,130,246,0.35)', ring: 'rgba(59,130,246,0.25)', label: 'COMPLETE',    bg: 'radial-gradient(circle at 40% 35%, #93c5fd, #2563eb 50%, #0f172a 100%)' },
}

// Wheelchair wheel SVG that orbits around the orb
function OrbitWheel({ size, radius, duration, startAngle, color }: {
  size: number; radius: number; duration: number; startAngle: number; color: string
}) {
  const spokes = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2
    return { x: 50 + Math.cos(a) * 34, y: 50 + Math.sin(a) * 34 }
  })

  return (
    <motion.div
      style={{ position: 'absolute', width: size, height: size, top: '50%', left: '50%', marginLeft: -size / 2, marginTop: -size / 2 }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      <motion.div
        style={{ position: 'absolute', top: -radius - size / 2, left: '50%', marginLeft: -size / 2, width: size, height: size }}
        animate={{ rotate: -360 }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="6" opacity="0.9"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
          <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
          <circle cx="50" cy="50" r="6" fill={color} opacity="0.9" />
          {spokes.map((s, i) => (
            <line key={i} x1="50" y1="50" x2={s.x} y2={s.y} stroke={color} strokeWidth="1.2" opacity="0.6" />
          ))}
        </svg>
      </motion.div>
    </motion.div>
  )
}

// Basketball icon floating around the orb
function OrbitBall({ radius, duration, startAngle, color }: { radius: number; duration: number; startAngle: number; color: string }) {
  return (
    <motion.div
      style={{ position: 'absolute', width: 32, height: 32, top: '50%', left: '50%', marginLeft: -16, marginTop: -16 }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay: startAngle / 360 * duration }}
    >
      <div style={{ position: 'absolute', top: -radius - 16, left: '50%', marginLeft: -16, width: 32, height: 32, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, #f07020, #c04010 60%, #5a1800 100%)`,
        boxShadow: `0 0 8px rgba(255,90,31,0.5), 0 2px 8px rgba(0,0,0,0.6)`,
        overflow: 'hidden',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1a0700" strokeWidth="6" opacity="0.8" />
          <path d="M50 -5 Q80 25 80 50 Q80 75 50 105" fill="none" stroke="#1a0700" strokeWidth="5" opacity="0.8" />
        </svg>
      </div>
    </motion.div>
  )
}

export default function DashboardOrb3D({ classification }: { classification: string }) {
  const theme = CLASS_THEME[classification] || CLASS_THEME.efficient
  const isDanger = classification === 'danger'

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Background glow */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${theme.glow} 0%, transparent 70%)`,
        }}
        animate={isDanger ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />

      {/* Orbit ring trails */}
      <div style={{ position: 'absolute', width: 340, height: 340, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${theme.ring}`, transform: 'rotateX(75deg)', transformOrigin: '50% 50%' }} />
        <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: `1px solid ${theme.ring}`, transform: 'rotateX(75deg) rotateY(45deg)', transformOrigin: '50% 50%', opacity: 0.5 }} />
      </div>

      {/* Orbiting wheelchair wheels */}
      <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <OrbitWheel size={52} radius={145} duration={8} startAngle={0} color={theme.color} />
          <OrbitWheel size={38} radius={175} duration={12} startAngle={180} color={theme.color} />
        </div>
      </div>

      {/* Orbiting basketball */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <OrbitBall radius={120} duration={6} startAngle={90} color={theme.color} />
      </div>

      {/* Main orb */}
      <motion.div
        key={classification}
        style={{
          width: 150, height: 150, borderRadius: '50%', position: 'relative', zIndex: 2,
          background: theme.bg,
          boxShadow: `0 0 60px ${theme.glow}, 0 0 120px ${theme.ring}, inset -10px -10px 30px rgba(0,0,0,0.5), inset 5px 5px 20px rgba(255,255,255,0.1)`,
        }}
        animate={isDanger
          ? { scale: [1, 1.08, 1], boxShadow: [`0 0 60px ${theme.glow}, 0 0 120px ${theme.ring}`, `0 0 90px ${theme.glow}, 0 0 180px ${theme.ring}`, `0 0 60px ${theme.glow}, 0 0 120px ${theme.ring}`] }
          : { scale: [1, 1.03, 1] }
        }
        transition={{ duration: isDanger ? 0.9 : 3, repeat: Infinity, ease: 'easeInOut' }}
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
      >
        {/* Highlight */}
        <div style={{ position: 'absolute', top: '14%', left: '18%', width: '35%', height: '28%', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', filter: 'blur(8px)' }} />
        {/* Inner ring */}
        <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: `2px solid rgba(255,255,255,0.12)` }} />
        {/* Center dot */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', transform: 'translate(-50%, -50%)', backdropFilter: 'blur(4px)' }} />
      </motion.div>

      {/* Outer pulse rings (danger) */}
      {isDanger && [1.4, 1.7, 2.0].map((scale, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', width: 150, height: 150, borderRadius: '50%',
            border: `2px solid ${theme.color}`,
            opacity: 0,
          }}
          animate={{ scale: [1, scale], opacity: [0.6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
        />
      ))}

      {/* Paralympic agitos watermark */}
      <div style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', opacity: 0.4 }}>
        <svg width="80" height="46" viewBox="0 0 140 80">
          <path d="M 30 40 A 28 28 0 0 1 86 20" fill="none" stroke="#EF3340" strokeWidth="8" strokeLinecap="round" />
          <path d="M 50 58 A 28 28 0 0 1 106 38" fill="none" stroke="#0085C7" strokeWidth="8" strokeLinecap="round" />
          <path d="M 70 74 A 28 28 0 0 1 126 54" fill="none" stroke="#009F6B" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
