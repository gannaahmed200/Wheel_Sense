import { motion, AnimatePresence } from 'framer-motion'

interface ClassificationBadgeProps {
  classification: string
}

const config: Record<string, { label: string; bg: string; border: string; color: string; glow: string }> = {
  efficient: { label: 'EFFICIENT', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#22c55e', glow: 'rgba(34,197,94,0.2)' },
  inefficient: { label: 'INEFFICIENT', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', color: '#eab308', glow: 'rgba(234,179,8,0.2)' },
  danger: { label: '⚠ DANGER', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.4)', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
  complete: { label: '✓ COMPLETE', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
}

export default function ClassificationBadge({ classification }: ClassificationBadgeProps) {
  const c = config[classification] || config.efficient
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={classification}
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.08, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          width: '100%', padding: '1rem', borderRadius: '0.75rem',
          border: `1px solid ${c.border}`, textAlign: 'center',
          background: c.bg, boxShadow: `0 0 20px ${c.glow}`,
        }}
      >
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.875rem', letterSpacing: '0.15em', color: c.color }}>
          {c.label}
        </span>
      </motion.div>
    </AnimatePresence>
  )
}
