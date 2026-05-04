import { motion } from 'framer-motion'
import { TrophyDownloadIcon } from '../components/icons'
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const chartData = Array.from({ length: 25 }, (_, i) => ({
  t: `${i * 5}s`,
  elbow: Math.max(0, Math.min(180, 70 + Math.sin(i * 0.4) * 40 + Math.random() * 15)),
  shoulder: Math.max(0, Math.min(180, 55 + Math.cos(i * 0.3) * 25 + Math.random() * 10)),
  trunk: Math.max(0, Math.min(90, 25 + Math.sin(i * 0.6) * 15 + Math.random() * 8)),
}))

const events = [
  { time: '00:15', type: 'WARNING', message: 'Push phase elbow extension elevated', joint: 'Elbow', value: '125°' },
  { time: '00:43', type: 'DANGER', message: 'Critical shoulder abduction detected', joint: 'Shoulder', value: '118°' },
  { time: '01:12', type: 'WARNING', message: 'Trunk lean exceeds threshold', joint: 'Trunk', value: '38°' },
  { time: '01:35', type: 'EFFICIENT', message: 'Optimal push stroke sequence', joint: 'All', value: '—' },
  { time: '01:58', type: 'DANGER', message: 'Elbow hyperextension risk', joint: 'Elbow', value: '141°' },
]

const summary = [
  { label: 'Court Time', value: '02:00' },
  { label: 'Push Strokes', value: '127' },
  { label: 'Detection Accuracy', value: '94.2%' },
  { label: 'Risk Events', value: '2' },
]

const breakdown = [
  { label: 'Efficient', pct: 65, color: '#22c55e' },
  { label: 'Inefficient', pct: 25, color: '#eab308' },
  { label: 'Risk Zone', pct: 10, color: '#ef4444' },
]

const eventStyle: Record<string, { bg: string; border: string; color: string }> = {
  WARNING: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)', color: '#eab308' },
  DANGER: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  EFFICIENT: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', color: '#22c55e' },
}

export default function History() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem', padding: '6rem 1.5rem 4rem', background: '#0a0a0a' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 7vw, 5rem)', letterSpacing: '0.15em' }}>
              <span style={{ color: '#fff' }}>SESSION </span>
              <span style={{ color: '#FF5A1F' }}>HISTORY</span>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', marginTop: '0.25rem' }}>Session 1 — Today</p>
          </div>
          <motion.button
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', background: '#FF5A1F', color: '#fff',
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              borderRadius: '0.75rem', border: 'none',
            }}
            whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(255,90,31,0.35)' } as any}
            whileTap={{ scale: 0.97 }}
          >
            <TrophyDownloadIcon style={{ width: 16, height: 16 }} />
            Export CSV
          </motion.button>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {summary.map(({ label, value }, i) => (
            <motion.div key={label}
              style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.25rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(255,90,31,0.08)' } as any}
            >
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#888880', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>{label}</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.25rem', color: '#fff' }}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart + breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

          <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Joint Angles Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <XAxis dataKey="t" tick={{ fill: '#888880', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888880', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} domain={[0, 180]} tickFormatter={v => `${v}°`} />
                <Tooltip
                  contentStyle={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontFamily: 'DM Sans' }}
                  labelStyle={{ color: '#888880', fontSize: 11 }}
                />
                <ReferenceLine y={130} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'Risk Zone', fill: '#ef4444', fontSize: 10, fontFamily: 'DM Sans' }} />
                <ReferenceLine y={100} stroke="#eab308" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'Warning Zone', fill: '#eab308', fontSize: 10, fontFamily: 'DM Sans' }} />
                <Line type="monotone" dataKey="elbow" stroke="#FF5A1F" strokeWidth={2} dot={false} name="Push Phase – Elbow" />
                <Line type="monotone" dataKey="shoulder" stroke="#3b82f6" strokeWidth={2} dot={false} name="Recovery – Shoulder" />
                <Line type="monotone" dataKey="trunk" stroke="#22c55e" strokeWidth={2} dot={false} name="Trunk Lean" />
                <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12, paddingTop: 16 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Classification Breakdown</h3>
            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: '1.5rem' }}>
              {breakdown.map(({ pct, color }) => (
                <motion.div key={color} style={{ background: color }}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {breakdown.map(({ label, pct, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.875rem' }}>{label}</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.125rem', lineHeight: 1, color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 3, background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events table */}
        <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session Events</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Time', 'Type', 'Message', 'Joint', 'Value'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontFamily: "'Barlow Condensed', sans-serif", color: '#888880', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(({ time, type, message, joint, value }, i) => {
                const c = eventStyle[type] || eventStyle.EFFICIENT
                return (
                  <motion.tr key={i}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'Bebas Neue', sans-serif", color: '#fff', fontSize: '1.125rem' }}>{time}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
                        {type}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.875rem' }}>{message}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'Barlow Condensed', sans-serif", color: '#888880', fontSize: '0.875rem' }}>{joint}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'Bebas Neue', sans-serif", color: '#FF5A1F', fontSize: '1.125rem' }}>{value}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </motion.div>
  )
}
