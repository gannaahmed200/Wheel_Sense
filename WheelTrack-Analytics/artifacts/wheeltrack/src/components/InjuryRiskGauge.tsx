import { motion } from 'framer-motion'

function riskLabel(value: number) {
  if (value >= 80) return { label: 'Critical Risk', color: '#ef4444' }
  if (value >= 60) return { label: 'High Risk', color: '#f97316' }
  if (value >= 30) return { label: 'Moderate Risk', color: '#eab308' }
  return { label: 'Low Risk', color: '#22c55e' }
}

export default function InjuryRiskGauge({ value = 0 }: { value?: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  const angle = -90 + (clamped / 100) * 180
  const risk = riskLabel(clamped)

  return (
    <div title="Risk blends trunk lean, shoulder abduction, elbow extension, asymmetry, and fatigue." style={{ position: 'relative', height: 170, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <svg width="240" height="150" viewBox="0 0 240 150" style={{ overflow: 'visible' }}>
        <path d="M 30 120 A 90 90 0 0 1 210 120" fill="none" stroke="#262626" strokeWidth="18" strokeLinecap="round" />
        <path d="M 30 120 A 90 90 0 0 1 84 37" fill="none" stroke="#22c55e" strokeWidth="18" strokeLinecap="round" />
        <path d="M 84 37 A 90 90 0 0 1 138 37" fill="none" stroke="#eab308" strokeWidth="18" strokeLinecap="round" />
        <path d="M 138 37 A 90 90 0 0 1 174 60" fill="none" stroke="#f97316" strokeWidth="18" strokeLinecap="round" />
        <path d="M 174 60 A 90 90 0 0 1 210 120" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" />
        <motion.g animate={{ rotate: angle }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} style={{ transformOrigin: '120px 120px' }}>
          <line x1="120" y1="120" x2="120" y2="43" stroke={risk.color} strokeWidth="4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${risk.color})` }} />
        </motion.g>
        <circle cx="120" cy="120" r="8" fill="#fff" />
      </svg>
      <div style={{ position: 'absolute', bottom: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', color: '#fff', lineHeight: 1 }}>{Math.round(clamped)}</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.12em', color: risk.color, fontWeight: 700 }}>{risk.label}</div>
      </div>
    </div>
  )
}
