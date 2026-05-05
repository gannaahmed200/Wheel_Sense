import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { CourtCameraIcon, MedalCheckIcon, PlayAnalysisIcon, UploadBallIcon } from '../components/icons'
import { useAnalysisContext, type ModelKey, type SourceType, type Thresholds } from '../contexts/AnalysisContext'

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
}

const joints = [
  { key: 'elbow', label: 'Push Phase - Elbow Extension', defaultWarn: 100, defaultDanger: 130, max: 180 },
  { key: 'shoulder', label: 'Recovery Phase - Shoulder Abduction', defaultWarn: 80, defaultDanger: 110, max: 180 },
  { key: 'trunk', label: 'Trunk Lean Angle', defaultWarn: 30, defaultDanger: 50, max: 90 },
] as const

const modelOptions: { value: ModelKey; label: string; description: string }[] = [
  {
    value: 'fine_tuned_yolo',
    label: 'Fine Tuned YOLO',
    description: 'Your trained wheelchair basketball pose model.',
  },
  {
    value: 'original_yolo',
    label: 'Original YOLO',
    description: 'Base YOLO11 pose model for comparison.',
  },
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
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.125rem', color: '#fff' }}>{value} deg</span>
      </div>
      <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }}>
        <motion.div
          style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 4, background: color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.1 }}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={event => onChange(Number(event.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'none', height: '100%' }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: `calc(${pct}% - 8px)`,
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: '2px solid #fff',
            background: color,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        />
      </div>
    </div>
  )
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`
}

export default function Configure() {
  const navigate = useNavigate()
  const cameraPreviewRef = useRef<HTMLVideoElement>(null)
  const { sourceType, setSourceType, modelKey, setModelKey, videoFile, setVideoFile, thresholds, setThresholds } = useAnalysisContext()
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')

  const onDrop = useCallback((files: File[]) => {
    const file = files[0] || null
    setVideoFile(file)
    setSourceType('video')
  }, [setSourceType, setVideoFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'video/mp4': ['.mp4'],
      'video/x-msvideo': ['.avi'],
      'video/quicktime': ['.mov'],
      'video/webm': ['.webm'],
    },
  })

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(videoFile)
    setVideoPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [videoFile])

  useEffect(() => {
    if (cameraPreviewRef.current && cameraStream) {
      cameraPreviewRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  useEffect(() => () => {
    cameraStream?.getTracks().forEach(track => track.stop())
  }, [cameraStream])

  const openCamera = async () => {
    setCameraError('')
    setSourceType('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
      setCameraStream(stream)
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : 'Camera permission was denied.')
    }
  }

  const setThreshold = (key: keyof Thresholds, type: 'warn' | 'danger', val: number) => {
    setThresholds({
      ...thresholds,
      [key]: {
        ...thresholds[key],
        [type]: val,
      },
    })
  }

  const canStart = sourceType === 'camera' ? Boolean(cameraStream) : Boolean(videoFile)
  const selectSource = (value: SourceType) => {
    setSourceType(value)
    if (value === 'camera') {
      void openCamera()
    }
  }

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
            Choose a video or live camera feed, then tune biomechanics thresholds for the session.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
            <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
              style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.25rem' }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Input Source</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { value: 'video' as const, label: 'Upload Video', icon: UploadBallIcon },
                  { value: 'camera' as const, label: 'Open Camera', icon: CourtCameraIcon },
                ].map(({ value, label, icon: Icon }) => (
                  <motion.button
                    key={value}
                    onClick={() => selectSource(value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.85rem',
                      borderRadius: '0.75rem',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      background: sourceType === value ? '#FF5A1F' : '#222222',
                      color: sourceType === value ? '#fff' : '#888880',
                      border: sourceType === value ? 'none' : '1px solid rgba(255,255,255,0.07)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    {label}
                  </motion.button>
                ))}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: canStart ? '#22c55e' : '#eab308' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.85rem' }}>
                  Selected: {sourceType === 'video' ? 'video upload' : cameraStream ? 'camera connected' : 'camera not connected'}
                </span>
              </div>
            </motion.div>

            <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
              style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.25rem' }}>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Pose Model</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {modelOptions.map(option => (
                  <motion.button
                    key={option.value}
                    onClick={() => setModelKey(option.value)}
                    style={{
                      minHeight: 96,
                      textAlign: 'left',
                      padding: '1rem',
                      borderRadius: '0.85rem',
                      background: modelKey === option.value ? 'rgba(255,90,31,0.14)' : '#222222',
                      border: modelKey === option.value ? '1px solid rgba(255,90,31,0.6)' : '1px solid rgba(255,255,255,0.07)',
                      color: '#fff',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span style={{ display: 'block', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: modelKey === option.value ? '#FF5A1F' : '#fff', marginBottom: '0.35rem' }}>
                      {option.label}
                    </span>
                    <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.8rem', lineHeight: 1.4 }}>
                      {option.description}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
              <div
                {...getRootProps()}
                style={{
                  minHeight: 260,
                  border: `2px dashed ${sourceType === 'video' ? (isDragActive ? '#FF5A1F' : videoFile ? '#22c55e' : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '1rem',
                  padding: '1rem',
                  cursor: 'none',
                  background: sourceType === 'video' ? '#1c1c1c' : '#141414',
                  transition: 'all 0.3s',
                }}
              >
                <input {...getInputProps()} />
                {videoPreviewUrl ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem', alignItems: 'center', height: '100%' }}>
                    <video src={videoPreviewUrl} muted playsInline style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: '0.75rem', background: '#080808' }} />
                    <div>
                      <MedalCheckIcon style={{ width: 40, height: 40, color: '#22c55e', marginBottom: '0.75rem' }} />
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.25rem', overflowWrap: 'anywhere' }}>{videoFile?.name}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formatBytes(videoFile?.size || 0)} - ready for YOLO11 pose analysis</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: 228, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <UploadBallIcon style={{ width: 52, height: 52, color: 'rgba(255,90,31,0.7)', marginBottom: '0.75rem' }} />
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.35rem' }}>
                      {isDragActive ? 'Drop video here' : 'Upload Basketball Session Video'}
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Supported: .mp4, .avi, .mov, .webm
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
              style={{ background: '#1c1c1c', border: `1px solid ${sourceType === 'camera' ? 'rgba(255,90,31,0.28)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '1rem', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Camera Preview</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.8rem' }}>{cameraStream ? 'Camera connected' : 'Camera inactive'}</p>
                </div>
                <motion.button
                  onClick={openCamera}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', borderRadius: '0.75rem', border: 'none', background: '#FF5A1F', color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <PlayAnalysisIcon style={{ width: 16, height: 16 }} />
                  Open
                </motion.button>
              </div>
              <video ref={cameraPreviewRef} autoPlay muted playsInline style={{ width: '100%', aspectRatio: '16 / 7', objectFit: 'cover', borderRadius: '0.75rem', background: '#080808' }} />
              {cameraError && <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#ef4444', fontSize: '0.8rem', marginTop: '0.75rem' }}>{cameraError}</p>}
            </motion.div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
            {joints.map((joint, i) => (
              <motion.div
                key={joint.key}
                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                transition={{ delay: i * 0.1 }}
                style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.5rem' }}
                whileHover={{ boxShadow: '0 8px 30px rgba(255,90,31,0.08)' } as any}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{joint.label}</h3>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.75rem', marginTop: '0.125rem' }}>Tune warning and danger thresholds</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '0.5rem', fontFamily: "'Bebas Neue', sans-serif", color: '#eab308', fontSize: '0.875rem' }}>
                      {thresholds[joint.key].warn} deg
                    </span>
                    <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', fontFamily: "'Bebas Neue', sans-serif", color: '#ef4444', fontSize: '0.875rem' }}>
                      {thresholds[joint.key].danger} deg
                    </span>
                  </div>
                </div>

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
                  Warning triggers <span style={{ color: '#eab308' }}>inefficient</span>; danger triggers <span style={{ color: '#ef4444' }}>danger</span> feedback.
                </p>
              </motion.div>
            ))}

            <motion.button
              onClick={() => navigate('/dashboard')}
              disabled={!canStart}
              style={{
                width: '100%',
                padding: '1rem',
                background: canStart ? '#FF5A1F' : '#2a2a2a',
                color: canStart ? '#fff' : '#666660',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.5rem',
                letterSpacing: '0.15em',
                borderRadius: '1rem',
                border: 'none',
              }}
              whileHover={canStart ? { scale: 1.02, boxShadow: '0 0 40px rgba(255,90,31,0.4)' } as any : undefined}
              whileTap={canStart ? { scale: 0.97 } : undefined}
            >
              START COURT ANALYSIS
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
