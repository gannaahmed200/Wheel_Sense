import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import GaugeArc from './GaugeArc'
import ClassificationBadge from './ClassificationBadge'
import InjuryRiskGauge from './InjuryRiskGauge'
import type { AggregateMetrics, AnalysisFrame, FrameMetrics, Thresholds } from '../contexts/AnalysisContext'

const emptyMetrics: FrameMetrics = {
  elbow: 0,
  shoulder: 0,
  trunk: 0,
  leftElbow: 0,
  rightElbow: 0,
  leftShoulder: 0,
  rightShoulder: 0,
  wristVelocity: 0,
  shoulderElevation: 0,
  classification: 'complete',
  confidence: 0,
}

const emptyAggregate: AggregateMetrics = {
  pushStrokeCount: 0,
  symmetryIndex: 0,
  averagePushPhaseDuration: 0,
  recoveryToPushRatio: 0,
  trunkStabilityScore: 100,
  fatigueIndex: 0,
  injuryRiskScore: 0,
  peakJointAngles: { elbow: 0, shoulder: 0, trunk: 0 },
  rangeOfMotion: { elbow: 0, shoulder: 0, trunk: 0 },
  classificationBreakdown: { efficient: 0, inefficient: 0, danger: 0, complete: 100 },
  recommendations: ['Waiting for analysis data.'],
}

function MetricRow({ label, value, color = '#fff' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.82rem' }}>{label}</span>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", color, fontSize: '1.1rem', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}

export default function MetricsPanel({
  metrics = emptyMetrics,
  aggregate = emptyAggregate,
  frames = [],
  thresholds,
}: {
  metrics?: FrameMetrics
  aggregate?: AggregateMetrics
  frames?: AnalysisFrame[]
  thresholds: Thresholds
}) {
  const chartData = frames.slice(-60).map(frame => ({
    t: `${Math.round(frame.timestamp)}s`,
    elbow: Math.round(frame.metrics.elbow),
    shoulder: Math.round(frame.metrics.shoulder),
    trunk: Math.round(frame.metrics.trunk),
  }))
  const left = Math.max(0, metrics.leftElbow || 0)
  const right = Math.max(0, metrics.rightElbow || 0)
  const total = Math.max(1, left + right)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflow: 'auto', paddingRight: 2 }}>
      <section style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1rem' }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Joint Angles</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.25rem' }}>
          <GaugeArc value={metrics.elbow} warning={thresholds.elbow.warn} danger={thresholds.elbow.danger} label="Elbow" />
          <GaugeArc value={metrics.shoulder} warning={thresholds.shoulder.warn} danger={thresholds.shoulder.danger} label="Shoulder" />
          <GaugeArc value={metrics.trunk} max={90} warning={thresholds.trunk.warn} danger={thresholds.trunk.danger} label="Trunk" />
        </div>
        <ClassificationBadge classification={metrics.classification} />
      </section>

      <section style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1rem' }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Injury Risk Score</p>
        <InjuryRiskGauge value={aggregate.injuryRiskScore} />
        <MetricRow label="Wrist velocity" value={`${Math.round(metrics.wristVelocity)} px/s`} color="#FF5A1F" />
        <MetricRow label="Trunk stability" value={`${Math.round(aggregate.trunkStabilityScore)} / 100`} color="#22c55e" />
        <MetricRow label="Fatigue index" value={`${aggregate.fatigueIndex.toFixed(1)}%`} color={aggregate.fatigueIndex > 20 ? '#ef4444' : '#eab308'} />
        <MetricRow label="Symmetry index" value={`${aggregate.symmetryIndex.toFixed(1)}%`} color={aggregate.symmetryIndex > 15 ? '#ef4444' : '#22c55e'} />
      </section>

      <section style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1rem' }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Push Stroke Symmetry</p>
        <div style={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', background: '#262626' }}>
          <div style={{ width: `${(left / total) * 100}%`, background: '#0085C7' }} />
          <div style={{ width: `${(right / total) * 100}%`, background: '#FF5A1F' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.45rem', fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.75rem' }}>
          <span>Left {Math.round(left)} deg</span>
          <span>Right {Math.round(right)} deg</span>
        </div>
      </section>

      <section style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1rem' }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Rolling Joint Chart</p>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData}>
            <XAxis dataKey="t" hide />
            <YAxis hide domain={[0, 180]} />
            <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontFamily: 'DM Sans' }} />
            <Line type="monotone" dataKey="elbow" stroke="#FF5A1F" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="shoulder" stroke="#0085C7" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="trunk" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1rem' }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Session Summary</p>
        <MetricRow label="Push strokes" value={`${aggregate.pushStrokeCount}`} color="#FF5A1F" />
        <MetricRow label="Push phase duration" value={`${aggregate.averagePushPhaseDuration.toFixed(2)}s`} />
        <MetricRow label="Recovery / push" value={`${aggregate.recoveryToPushRatio.toFixed(2)}`} />
        <MetricRow label="Elbow ROM" value={`${aggregate.rangeOfMotion.elbow.toFixed(0)} deg`} />
        <MetricRow label="Peak shoulder" value={`${aggregate.peakJointAngles.shoulder.toFixed(0)} deg`} />
      </section>

      <section style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1rem' }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Session Insights</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {aggregate.recommendations.slice(0, 3).map(item => (
            <div key={item} style={{ fontFamily: "'DM Sans', sans-serif", color: '#c7c7bd', fontSize: '0.8rem', lineHeight: 1.5, padding: '0.75rem', background: '#141414', borderRadius: '0.65rem', border: '1px solid rgba(255,255,255,0.05)' }}>{item}</div>
          ))}
        </div>
      </section>
    </div>
  )
}
