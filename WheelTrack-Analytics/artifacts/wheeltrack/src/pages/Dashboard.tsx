import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { WhistleOnIcon, WhistleOffIcon } from '../components/icons'
import GaugeArc from '../components/GaugeArc'
import ClassificationBadge from '../components/ClassificationBadge'
import CourtHeatmap from '../components/CourtHeatmap'
import { useAudio } from '../hooks/useAudio'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

interface FrameData {
  elbow: number
  shoulder: number
  trunk: number
  classification: string
  confidence: number
  fps: number
  strokes: number
}

function useMockData() {
  const [data, setData] = useState<FrameData>({
    elbow: 92, shoulder: 67, trunk: 21,
    classification: 'efficient', confidence: 92.3, fps: 30, strokes: 2,
  })
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const elbow = Math.max(40, Math.min(160, prev.elbow + (Math.random() - 0.48) * 8))
        const shoulder = Math.max(20, Math.min(140, prev.shoulder + (Math.random() - 0.5) * 6))
        const trunk = Math.max(5, Math.min(60, prev.trunk + (Math.random() - 0.5) * 4))
        const classification = elbow > 130 ? 'danger' : elbow > 100 ? 'inefficient' : elbow < 60 ? 'complete' : 'efficient'
        return {
          elbow, shoulder, trunk, classification,
          confidence: 90 + Math.random() * 8,
          fps: 28 + Math.random() * 4,
          strokes: prev.strokes + (Math.random() > 0.95 ? 1 : 0),
        }
      })
    }, 800)
    return () => clearInterval(interval)
  }, [])
  return data
}

export default function Dashboard() {
  const data = useMockData()
  const { play, muted, toggleMute } = useAudio()
  const prevClass = useRef(data.classification)
  const [time, setTime] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTime(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (data.classification !== prevClass.current) {
      play(data.classification)
      prevClass.current = data.classification
    }
  }, [data.classification, play])

  const isDanger = data.classification === 'danger'
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const pills = [
    { label: 'FPS', value: Math.round(data.fps) },
    { label: 'Confidence', value: `${data.confidence.toFixed(1)}%` },
    { label: 'Court Time', value: fmt(time) },
    { label: 'Push Strokes', value: Math.round(data.strokes) },
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', paddingTop: '4rem', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>

      {/* Stat pills */}
      <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', alignItems: 'center' }}>
        {pills.map(({ label, value }) => (
          <motion.div key={label}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#1c1c1c',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '9999px',
            }}
            whileHover={{ borderColor: 'rgba(255,90,31,0.3)' } as any}
          >
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#888880', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{label}</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FF5A1F', fontSize: '1.125rem', lineHeight: 1 }}>{value}</span>
          </motion.div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9999px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isDanger ? '#ef4444' : '#22c55e', animation: isDanger ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#888880', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {isDanger ? 'RISK DETECTED' : 'LIVE'}
          </span>
        </div>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, gap: '1rem', padding: '1rem 1.5rem', overflow: 'hidden' }}>

        {/* 3D Orb + Court Camera panel */}
        <motion.div
          style={{
            flex: 7, position: 'relative', borderRadius: '1rem', overflow: 'hidden',
            background: '#080808',
            border: `1px solid ${isDanger ? 'rgba(239,68,68,0.55)' : 'rgba(255,255,255,0.05)'}`,
            transition: 'border-color 0.3s',
          }}
        >
          {/* Danger pulse border */}
          {isDanger && (
            <motion.div
              style={{ position: 'absolute', inset: 0, borderRadius: '1rem', border: '2px solid rgba(239,68,68,0.6)', zIndex: 10, pointerEvents: 'none' }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}

          {/* Live badge */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 20, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Live</span>
          </div>

          {/* Classification label overlay */}
          <div style={{ position: 'absolute', bottom: '1.5rem', left: 0, right: 0, zIndex: 20, textAlign: 'center', pointerEvents: 'none' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#444440', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Biomechanics Visualization — AI Pose Engine
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#333', fontSize: '0.65rem', marginTop: '0.25rem' }}>
              Connect ws://localhost:8000/ws/analyze for live skeletal overlay
            </p>
          </div>

          {/* Court heatmap — fills the panel */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <CourtHeatmap
              elbow={data.elbow}
              shoulder={data.shoulder}
              trunk={data.trunk}
              classification={data.classification}
            />
          </div>

          <canvas id="poseCanvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, zIndex: 5 }} />
        </motion.div>

        {/* Metrics panel */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.25rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Joint Angles</p>
              <motion.button
                onClick={toggleMute}
                style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#222222', border: '1px solid rgba(255,255,255,0.07)', color: '#888880' }}
                whileHover={{ scale: 1.05, color: '#fff' } as any}
                whileTap={{ scale: 0.95 }}
              >
                {muted ? <WhistleOffIcon style={{ width: 16, height: 16 }} /> : <WhistleOnIcon style={{ width: 16, height: 16 }} />}
              </motion.button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              <GaugeArc value={data.elbow} warning={100} danger={130} label="Elbow" />
              <GaugeArc value={data.shoulder} warning={80} danger={110} label="Shoulder" />
              <GaugeArc value={data.trunk} max={90} warning={30} danger={50} label="Trunk" />
            </div>

            <ClassificationBadge classification={data.classification} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </motion.div>
  )
}
