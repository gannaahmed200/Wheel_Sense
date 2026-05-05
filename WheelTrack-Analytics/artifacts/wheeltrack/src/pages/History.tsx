import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts'
import { TrophyDownloadIcon } from '../components/icons'
import { useAnalysisContext, type AnalysisFrame, type AnalysisResult } from '../contexts/AnalysisContext'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const eventStyle: Record<string, { bg: string; border: string; color: string }> = {
  WARNING: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)', color: '#eab308' },
  DANGER: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  EFFICIENT: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', color: '#22c55e' },
}

function fmt(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function makeEvents(frames: AnalysisFrame[]) {
  const events: { time: string; type: string; message: string; joint: string; value: string }[] = []
  const seen = new Set<string>()
  for (const frame of frames) {
    const { metrics } = frame
    const type = metrics.classification === 'danger' ? 'DANGER' : metrics.classification === 'inefficient' ? 'WARNING' : ''
    if (!type) continue
    const joint = metrics.elbow >= metrics.shoulder && metrics.elbow >= metrics.trunk ? 'Elbow' : metrics.shoulder >= metrics.trunk ? 'Shoulder' : 'Trunk'
    const value = joint === 'Elbow' ? metrics.elbow : joint === 'Shoulder' ? metrics.shoulder : metrics.trunk
    const bucket = `${type}-${joint}-${Math.floor(frame.timestamp / 10)}`
    if (seen.has(bucket)) continue
    seen.add(bucket)
    events.push({
      time: fmt(frame.timestamp),
      type,
      message: type === 'DANGER' ? `${joint} exceeded danger threshold` : `${joint} entered warning threshold`,
      joint,
      value: `${Math.round(value)} deg`,
    })
    if (events.length >= 10) break
  }
  if (!events.length && frames.length) {
    events.push({ time: fmt(0), type: 'EFFICIENT', message: 'No danger or warning threshold crossings detected', joint: 'All', value: '-' })
  }
  return events
}

function exportCsv(session: AnalysisResult | null) {
  if (!session) return
  const rows = [
    ['time', 'elbow', 'shoulder', 'trunk', 'classification', 'confidence', 'wrist_velocity'],
    ...session.frames.map(frame => [
      frame.timestamp.toFixed(2),
      frame.metrics.elbow.toFixed(2),
      frame.metrics.shoulder.toFixed(2),
      frame.metrics.trunk.toFixed(2),
      frame.metrics.classification,
      frame.metrics.confidence.toFixed(2),
      frame.metrics.wristVelocity.toFixed(2),
    ]),
  ]
  const blob = new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `wheelsense-session-${session.id}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function History() {
  const navigate = useNavigate()
  const { sessionHistory, analysisResults } = useAnalysisContext()
  const session = sessionHistory[0] || analysisResults

  const chartData = useMemo(() => (session?.frames || []).map(frame => ({
    t: `${Math.round(frame.timestamp)}s`,
    elbow: Math.round(frame.metrics.elbow),
    shoulder: Math.round(frame.metrics.shoulder),
    trunk: Math.round(frame.metrics.trunk),
  })), [session])
  const events = useMemo(() => makeEvents(session?.frames || []), [session])
  const aggregate = session?.aggregateMetrics
  const breakdown = aggregate ? [
    { label: 'Efficient', pct: aggregate.classificationBreakdown.efficient || 0, color: '#22c55e' },
    { label: 'Inefficient', pct: aggregate.classificationBreakdown.inefficient || 0, color: '#eab308' },
    { label: 'Risk Zone', pct: aggregate.classificationBreakdown.danger || 0, color: '#ef4444' },
  ] : []
  const summary = aggregate ? [
    { label: 'Court Time', value: fmt(session?.duration || session?.frames.at(-1)?.timestamp || 0) },
    { label: 'Push Strokes', value: `${aggregate.pushStrokeCount}` },
    { label: 'Detection Accuracy', value: `${Math.round((session?.frames.reduce((sum, frame) => sum + frame.metrics.confidence, 0) || 0) / Math.max(1, session?.frames.length || 1))}%` },
    { label: 'Risk Events', value: `${events.filter(event => event.type === 'DANGER').length}` },
  ] : []

  if (!session) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
        style={{ minHeight: '100vh', padding: '6rem 1.5rem 4rem', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 520 }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 7vw, 5rem)', letterSpacing: '0.15em', color: '#fff' }}>NO SESSIONS YET</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', margin: '0.5rem 0 1.5rem' }}>Start your first analysis to populate session history with real pose metrics.</p>
          <motion.button
            onClick={() => navigate('/configure')}
            style={{ padding: '0.9rem 1.4rem', background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: '0.75rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Start Analysis
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem', padding: '6rem 1.5rem 4rem', background: '#0a0a0a' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 7vw, 5rem)', letterSpacing: '0.15em' }}>
              <span style={{ color: '#fff' }}>SESSION </span>
              <span style={{ color: '#FF5A1F' }}>HISTORY</span>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', marginTop: '0.25rem' }}>
              {session.sourceType === 'video' ? session.fileName || 'Uploaded video' : 'Live camera session'} - {session.modelLabel || 'Fine Tuned YOLO'} - {new Date(session.createdAt).toLocaleString()}
            </p>
          </div>
          <motion.button
            onClick={() => exportCsv(session)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#FF5A1F', color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: '0.75rem', border: 'none' }}
            whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(255,90,31,0.35)' } as any}
            whileTap={{ scale: 0.97 }}
          >
            <TrophyDownloadIcon style={{ width: 16, height: 16 }} />
            Export CSV
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {summary.map(({ label, value }, i) => (
            <motion.div key={label} style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.25rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#888880', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>{label}</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.25rem', color: '#fff' }}>{value}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Joint Angles Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <XAxis dataKey="t" tick={{ fill: '#888880', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888880', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} domain={[0, 180]} tickFormatter={v => `${v} deg`} />
                <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontFamily: 'DM Sans' }} labelStyle={{ color: '#888880', fontSize: 11 }} />
                <ReferenceLine y={130} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.6} />
                <ReferenceLine y={100} stroke="#eab308" strokeDasharray="4 4" strokeOpacity={0.6} />
                <Line type="monotone" dataKey="elbow" stroke="#FF5A1F" strokeWidth={2} dot={false} name="Push Phase - Elbow" />
                <Line type="monotone" dataKey="shoulder" stroke="#0085C7" strokeWidth={2} dot={false} name="Recovery - Shoulder" />
                <Line type="monotone" dataKey="trunk" stroke="#22c55e" strokeWidth={2} dot={false} name="Trunk Lean" />
                <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12, paddingTop: 16 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Classification Breakdown</h3>
            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: '1.5rem' }}>
              {breakdown.map(({ pct, color }) => (
                <motion.div key={color} style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
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
                    <motion.div style={{ height: '100%', borderRadius: 3, background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
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
                  <motion.tr key={`${time}-${message}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: "'Bebas Neue', sans-serif", color: '#fff', fontSize: '1.125rem' }}>{time}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>{type}</span>
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

        <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Recommendations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem' }}>
            {(aggregate?.recommendations || []).map(item => (
              <div key={item} style={{ fontFamily: "'DM Sans', sans-serif", color: '#c7c7bd', fontSize: '0.875rem', lineHeight: 1.5, background: '#141414', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.85rem', padding: '1rem' }}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
