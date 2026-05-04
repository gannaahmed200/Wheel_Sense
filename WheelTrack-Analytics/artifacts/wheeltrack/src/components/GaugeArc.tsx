import { motion } from 'framer-motion'

interface GaugeArcProps {
  value?: number
  max?: number
  warning?: number
  danger?: number
  label?: string
}

export default function GaugeArc({ value = 0, max = 180, warning = 100, danger = 130, label = '' }: GaugeArcProps) {
  const r = 52
  const cx = 64, cy = 64
  const sweepAngle = 240
  const circumference = 2 * Math.PI * r
  const arcLength = (sweepAngle / 360) * circumference
  const fillLength = Math.max(0, Math.min(value / max, 1)) * arcLength

  const color = value >= danger ? '#ef4444' : value >= warning ? '#eab308' : '#22c55e'
  const glowColor = value >= danger ? 'rgba(239,68,68,0.3)' : value >= warning ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth="8"
            strokeDasharray={`${arcLength} ${circumference}`} strokeLinecap="round"
            transform="rotate(150 64 64)" />
          <motion.circle cx={cx} cy={cy} r={r} fill="none" strokeWidth="8"
            strokeDasharray={`${fillLength} ${circumference}`} strokeLinecap="round"
            transform="rotate(150 64 64)"
            animate={{ stroke: color, strokeDasharray: `${fillLength} ${circumference}` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
          />
          <text x="64" y="60" textAnchor="middle" fill="white"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28 }}>
            {Math.round(value)}°
          </text>
          <text x="64" y="76" textAnchor="middle" fill="#888880" fontSize="10"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {label}
          </text>
        </svg>
        {value >= danger && (
          <motion.div
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(239,68,68,0.5)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  )
}
