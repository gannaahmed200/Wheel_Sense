import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CourtHeatmap from '../components/CourtHeatmap'
import MetricsPanel from '../components/MetricsPanel'
import PoseOverlay from '../components/PoseOverlay'
import VideoPlayer from '../components/VideoPlayer'
import { WhistleOffIcon, WhistleOnIcon } from '../components/icons'
import { useAnalysisContext, type AnalysisFrame, type FrameMetrics } from '../contexts/AnalysisContext'
import { useAudio } from '../hooks/useAudio'
import { useAnalysis } from '../hooks/useAnalysis'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const fallbackMetrics: FrameMetrics = {
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

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function Dashboard() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const startedRef = useRef(false)
  const [currentFrame, setCurrentFrame] = useState<AnalysisFrame | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const { sourceType, modelKey, videoFile, thresholds, addSessionResult } = useAnalysisContext()
  const { play, muted, toggleMute } = useAudio()
  const previousClassRef = useRef<string>('complete')

  const {
    frames,
    currentMetrics,
    aggregateMetrics,
    isAnalyzing,
    progress,
    error,
    startVideoAnalysis,
    startCameraAnalysis,
    stopCameraAnalysis,
  } = useAnalysis({ sourceType, modelKey, videoFile, thresholds })

  const metrics = currentFrame?.metrics || currentMetrics || fallbackMetrics

  useEffect(() => {
    if (metrics.classification !== previousClassRef.current) {
      play(metrics.classification)
      previousClassRef.current = metrics.classification
    }
  }, [metrics.classification, play])

  useEffect(() => {
    if (sourceType !== 'video' || startedRef.current) return
    startedRef.current = true
    void startVideoAnalysis().then(result => {
      if (result) addSessionResult(result)
    })
  }, [addSessionResult, sourceType, startVideoAnalysis])

  useEffect(() => {
    if (sourceType !== 'camera' || startedRef.current) return
    startedRef.current = true
    let cancelled = false
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
      .then(stream => {
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop())
          return
        }
        cameraStreamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraReady(true)
          startCameraAnalysis(videoRef.current)
        }
      })
      .catch(err => {
        console.error(err)
      })

    return () => {
      cancelled = true
      cameraStreamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [sourceType, startCameraAnalysis])

  const finishCameraSession = useCallback(() => {
    const result = stopCameraAnalysis()
    cameraStreamRef.current?.getTracks().forEach(track => track.stop())
    addSessionResult(result)
    navigate('/history')
  }, [addSessionResult, navigate, stopCameraAnalysis])

  const latestFrame = currentFrame || frames[frames.length - 1] || null
  const courtMetrics = latestFrame?.metrics || metrics
  const pills = [
    { label: 'FPS', value: sourceType === 'camera' ? '8-15' : Math.round((frames.length / Math.max(1, latestFrame?.timestamp || 1))).toString() },
    { label: 'Confidence', value: `${Math.round(metrics.confidence || 0)}%` },
    { label: sourceType === 'camera' ? 'Court Time' : 'Duration', value: fmt(latestFrame?.timestamp || 0) },
    { label: 'Push Strokes', value: Math.round(aggregateMetrics.pushStrokeCount).toString() },
    { label: 'Model', value: modelKey === 'original_yolo' ? 'Original' : 'Fine Tuned' },
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', paddingTop: '4rem', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', alignItems: 'center' }}>
        {pills.map(({ label, value }) => (
          <motion.div key={label}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9999px' }}
            whileHover={{ borderColor: 'rgba(255,90,31,0.3)' } as any}
          >
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#888880', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{label}</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FF5A1F', fontSize: '1.125rem', lineHeight: 1 }}>{value}</span>
          </motion.div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9999px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: metrics.classification === 'danger' ? '#ef4444' : isAnalyzing ? '#22c55e' : '#3b82f6', animation: isAnalyzing ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#888880', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {error ? 'BACKEND ERROR' : isAnalyzing ? 'ANALYZING' : 'READY'}
          </span>
        </div>
        <motion.button
          onClick={toggleMute}
          style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#222222', border: '1px solid rgba(255,255,255,0.07)', color: '#888880' }}
          whileHover={{ scale: 1.05, color: '#fff' } as any}
          whileTap={{ scale: 0.95 }}
        >
          {muted ? <WhistleOffIcon style={{ width: 16, height: 16 }} /> : <WhistleOnIcon style={{ width: 16, height: 16 }} />}
        </motion.button>
      </div>

      {isAnalyzing && sourceType === 'video' && (
        <div style={{ height: 4, background: '#151515' }}>
          <motion.div style={{ height: '100%', background: '#FF5A1F' }} animate={{ width: `${progress}%` }} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(330px, 3fr)', flex: 1, gap: '1rem', padding: '1rem 1.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateRows: 'minmax(360px, 2fr) minmax(220px, 1fr)', gap: '1rem', minWidth: 0 }}>
          <motion.div
            style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', background: '#080808', border: `1px solid ${metrics.classification === 'danger' ? 'rgba(239,68,68,0.55)' : 'rgba(255,255,255,0.06)'}` }}
          >
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 5, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: sourceType === 'camera' ? '#ef4444' : '#FF5A1F', animation: 'pulse 1s infinite' }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{sourceType === 'camera' ? 'Recording' : 'Video Analysis'}</span>
            </div>

            {sourceType === 'video' ? (
              <VideoPlayer frames={frames} onFrameChange={setCurrentFrame} />
            ) : (
              <>
                <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scaleX(-1)', background: '#050505' }} />
                <PoseOverlay frame={latestFrame} mirrored />
                {!cameraReady && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", color: '#888880' }}>
                    Waiting for camera permission...
                  </div>
                )}
                <motion.button
                  onClick={finishCameraSession}
                  style={{ position: 'absolute', right: '1rem', bottom: '1rem', zIndex: 6, padding: '0.75rem 1.2rem', borderRadius: '0.75rem', border: 'none', background: '#ef4444', color: '#fff', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Stop Session
                </motion.button>
              </>
            )}

            {error && (
              <div style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '1rem', padding: '1rem', borderRadius: '0.85rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fecaca', fontFamily: "'DM Sans', sans-serif", zIndex: 8 }}>
                {error}
              </div>
            )}
          </motion.div>

          <div style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', background: '#080808', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CourtHeatmap
              elbow={courtMetrics.elbow}
              shoulder={courtMetrics.shoulder}
              trunk={courtMetrics.trunk}
              classification={courtMetrics.classification}
            />
          </div>
        </div>

        <MetricsPanel metrics={metrics} aggregate={aggregateMetrics} frames={frames} thresholds={thresholds} />
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
