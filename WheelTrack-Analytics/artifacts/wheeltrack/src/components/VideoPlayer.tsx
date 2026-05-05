import { useEffect, useMemo, useState } from 'react'
import type { AnalysisFrame } from '../contexts/AnalysisContext'

export default function VideoPlayer({
  frames,
  onFrameChange,
}: {
  frames: AnalysisFrame[]
  onFrameChange: (frame: AnalysisFrame | null) => void
}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const current = frames[index] || null
  const dangerMarkers = useMemo(() => frames.map((frame, i) => frame.metrics.classification === 'danger' ? i : -1).filter(i => i >= 0), [frames])

  useEffect(() => {
    onFrameChange(current)
  }, [current, onFrameChange])

  useEffect(() => {
    if (!playing || frames.length === 0) return
    const timer = window.setInterval(() => {
      setIndex(prev => {
        if (prev >= frames.length - 1) {
          setPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 100)
    return () => window.clearInterval(timer)
  }, [frames.length, playing])

  if (!frames.length) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", color: '#888880' }}>
        Waiting for analyzed frames...
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
        {current?.annotatedFrame ? (
          <img src={current.annotatedFrame} alt="Annotated pose frame" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : null}
      </div>

      <div style={{ padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.82)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={index}
            onChange={event => setIndex(Number(event.target.value))}
            style={{ width: '100%', accentColor: '#FF5A1F' }}
          />
          {dangerMarkers.map(marker => (
            <span
              key={marker}
              title="Danger event"
              style={{ position: 'absolute', left: `${(marker / Math.max(1, frames.length - 1)) * 100}%`, top: -2, width: 3, height: 18, background: '#ef4444', borderRadius: 2, pointerEvents: 'none' }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setIndex(value => Math.max(0, value - 1))} style={controlStyle}>Frame -</button>
            <button onClick={() => setPlaying(value => !value)} style={{ ...controlStyle, background: '#FF5A1F', color: '#fff' }}>{playing ? 'Pause' : 'Play'}</button>
            <button onClick={() => setIndex(value => Math.min(frames.length - 1, value + 1))} style={controlStyle}>Frame +</button>
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.82rem' }}>
            {Math.round(current?.timestamp || 0)}s - frame {index + 1} / {frames.length}
          </span>
        </div>
      </div>
    </div>
  )
}

const controlStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '0.55rem',
  border: '1px solid rgba(255,255,255,0.08)',
  background: '#1c1c1c',
  color: '#c7c7bd',
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
}
