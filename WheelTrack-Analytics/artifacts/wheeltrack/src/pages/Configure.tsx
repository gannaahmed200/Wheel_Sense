import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { UploadBallIcon, MedalCheckIcon, CourtCameraIcon, PlayAnalysisIcon } from '../components/icons'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

const joints = [
  { key: 'elbow', label: 'Push Phase — Elbow Extension', defaultWarn: 100, defaultDanger: 130, max: 180 },
  { key: 'shoulder', label: 'Recovery Phase — Shoulder Abduction', defaultWarn: 80, defaultDanger: 110, max: 180 },
  { key: 'trunk', label: 'Trunk Lean Angle', defaultWarn: 30, defaultDanger: 50, max: 90 },
]

interface ThresholdSliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  isWarning: boolean
  max: number
}

function ThresholdSlider({ label, value, onChange, isWarning, max }: ThresholdSliderProps) {
  const pct = (value / max) * 100
  const color = isWarning ? '#eab308' : '#ef4444'
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color }}>{label}</span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.125rem', color: '#fff' }}>{value}°</span>
      </div>
      <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }}>
        <motion.div
          style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 4, background: color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.1 }}
        />
        <input
          type="range" min={0} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'none', height: '100%' }}
        />
        <div
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            left: `calc(${pct}% - 8px)`,
            width: 16, height: 16, borderRadius: '50%',
            border: '2px solid #fff', background: color,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        />
      </div>
    </div>
  )
}

type Thresholds = Record<string, { warn: number; danger: number }>

export default function Configure() {
  const navigate = useNavigate()
  const [model, setModel] = useState<File | null>(null)
  const [source, setSource] = useState('webcam')
  const [thresholds, setThresholds] = useState<Thresholds>(
    Object.fromEntries(joints.map(j => [j.key, { warn: j.defaultWarn, danger: j.defaultDanger }]))
  )

  const onDrop = useCallback((files: File[]) => setModel(files[0] || null), [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': ['.pkl', '.h5', '.onnx'] },
  })

  const setThreshold = (key: string, type: 'warn' | 'danger', val: number) =>
    setThresholds(prev => ({ ...prev, [key]: { ...prev[key], [type]: val } }))

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem', padding: '6rem 1.5rem 4rem', background: '#0a0a0a' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

        <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 7vw, 5rem)', letterSpacing: '0.15em' }}>
            <span style={{ color: '#fff' }}>CONFIGURE </span>
            <span style={{ color: '#FF5A1F' }}>SESSION</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', marginTop: '0.25rem' }}>
            Configure biomechanics thresholds for wheelchair basketball propulsion analysis
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Drop zone */}
            <motion.div
              variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? '#FF5A1F' : model ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '1rem',
                padding: '2.5rem',
                textAlign: 'center',
                cursor: 'none',
                background: isDragActive ? 'rgba(255,90,31,0.05)' : model ? 'rgba(34,197,94,0.05)' : '#1c1c1c',
                transition: 'all 0.3s',
              }}
            >
              <input {...getInputProps()} />
              {model ? (
                <>
                  <MedalCheckIcon style={{ width: 48, height: 48, color: '#22c55e', margin: '0 auto 0.75rem' }} />
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#4ade80', fontSize: '1.25rem' }}>{model.name}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.875rem', marginTop: '0.25rem' }}>Model loaded successfully</p>
                </>
              ) : (
                <>
                  <UploadBallIcon style={{ width: 48, height: 48, color: 'rgba(255,90,31,0.6)', margin: '0 auto 0.75rem' }} />
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.25rem' }}>
                    {isDragActive ? 'Drop it here' : 'Upload Pose Estimation Model'}
                  </p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Wheelchair basketball trained .onnx, .pkl, or .h5
                  </p>
                </>
              )}
            </motion.div>

            {/* Active model info */}
            <motion.div
              variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
              style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}
            >
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#888880', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>Active Model</p>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem' }}>
                {model ? model.name : 'No model uploaded — threshold-only mode'}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Supported: .onnx, .h5 (pickle disabled by default on backend)
              </p>
            </motion.div>

            {/* Video source */}
            <motion.div
              variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
              style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}
            >
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Video Source</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: 'webcam', label: 'Court Camera', icon: CourtCameraIcon },
                  { value: 'video', label: 'Game Footage', icon: PlayAnalysisIcon },
                ].map(({ value, label, icon: Icon }) => (
                  <motion.button
                    key={value}
                    onClick={() => setSource(value)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.75rem', borderRadius: '0.75rem',
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      transition: 'all 0.2s',
                      background: source === value ? '#FF5A1F' : '#222222',
                      color: source === value ? '#fff' : '#888880',
                      border: source === value ? 'none' : '1px solid rgba(255,255,255,0.07)',
                      boxShadow: source === value ? '0 4px 20px rgba(255,90,31,0.25)' : 'none',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Threshold sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {joints.map((joint, i) => (
              <motion.div
                key={joint.key}
                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                transition={{ delay: i * 0.1 }}
                style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}
                whileHover={{ boxShadow: '0 8px 30px rgba(255,90,31,0.08)' } as any}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{joint.label}</h3>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.75rem', marginTop: '0.125rem' }}>Tune warning and danger thresholds</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '0.5rem', fontFamily: "'Bebas Neue', sans-serif", color: '#eab308', fontSize: '0.875rem' }}>
                      {thresholds[joint.key].warn}°
                    </span>
                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', fontFamily: "'Bebas Neue', sans-serif", color: '#ef4444', fontSize: '0.875rem' }}>
                      {thresholds[joint.key].danger}°
                    </span>
                  </div>
                </div>

                {/* Color-coded track zones */}
                <div style={{ marginBottom: '1.25rem', height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ background: 'rgba(34,197,94,0.6)', width: `${(thresholds[joint.key].warn / joint.max) * 100}%` }} />
                  <div style={{ background: 'rgba(234,179,8,0.6)', width: `${((thresholds[joint.key].danger - thresholds[joint.key].warn) / joint.max) * 100}%` }} />
                  <div style={{ background: 'rgba(239,68,68,0.6)', flex: 1 }} />
                </div>

                <ThresholdSlider
                  label="Warning Threshold"
                  value={thresholds[joint.key].warn}
                  onChange={v => setThreshold(joint.key, 'warn', Math.min(v, thresholds[joint.key].danger - 5))}
                  isWarning={true}
                  max={joint.max}
                />
                <ThresholdSlider
                  label="Danger Threshold"
                  value={thresholds[joint.key].danger}
                  onChange={v => setThreshold(joint.key, 'danger', Math.max(v, thresholds[joint.key].warn + 5))}
                  isWarning={false}
                  max={joint.max}
                />

                <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#444440', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  Warning triggers <span style={{ color: '#eab308' }}>inefficient</span>;{' '}
                  danger triggers <span style={{ color: '#ef4444' }}>danger</span> alert
                </p>
              </motion.div>
            ))}

            <motion.button
              onClick={() => navigate('/dashboard')}
              style={{
                width: '100%', padding: '1rem', background: '#FF5A1F',
                color: '#fff', fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.5rem', letterSpacing: '0.15em', borderRadius: '1rem', border: 'none',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(255,90,31,0.4)' } as any}
              whileTap={{ scale: 0.97 }}
            >
              START COURT ANALYSIS →
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
