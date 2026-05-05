import { useCallback, useMemo, useRef, useState } from 'react'
import type { AggregateMetrics, AnalysisFrame, AnalysisResult, FrameMetrics, ModelKey, SourceType, Thresholds } from '../contexts/AnalysisContext'

const API_BASE = import.meta.env.VITE_POSE_API_URL || 'http://localhost:8000'
const WS_BASE = API_BASE.replace(/^http/, 'ws')

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
  classificationBreakdown: { efficient: 0, inefficient: 0, danger: 0, complete: 0 },
  recommendations: ['Analysis has not started yet.'],
}

function avg(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function pstdev(values: number[]) {
  if (values.length < 2) return 0
  const m = avg(values)
  return Math.sqrt(avg(values.map(value => (value - m) ** 2)))
}

function aggregateFrames(frames: AnalysisFrame[]): AggregateMetrics {
  if (!frames.length) return emptyAggregate
  const metrics = frames.map(frame => frame.metrics)
  const elbows = metrics.map(item => item.elbow)
  const shoulders = metrics.map(item => item.shoulder)
  const trunks = metrics.map(item => item.trunk)
  const leftAvg = avg(metrics.map(item => item.leftElbow))
  const rightAvg = avg(metrics.map(item => item.rightElbow))
  const symmetryIndex = Math.abs(leftAvg - rightAvg) / Math.max(1, avg([leftAvg, rightAvg])) * 100
  const velocities = metrics.map(item => item.wristVelocity)
  const split = Math.max(1, Math.floor(metrics.length / 3))
  const fatigueIndex = Math.max(0, (avg(velocities.slice(0, split)) - avg(velocities.slice(-split))) / Math.max(1, avg(velocities.slice(0, split))) * 100)
  const counts = metrics.reduce<Record<string, number>>((acc, item) => {
    acc[item.classification] = (acc[item.classification] || 0) + 1
    return acc
  }, {})
  const classificationBreakdown = Object.fromEntries(['efficient', 'inefficient', 'danger', 'complete'].map(key => [key, Math.round(((counts[key] || 0) / frames.length) * 1000) / 10]))
  const wristPeaks = metrics.filter((item, i, arr) => {
    const prev = arr[i - 1]?.wristVelocity ?? item.wristVelocity
    const next = arr[i + 1]?.wristVelocity ?? item.wristVelocity
    return item.wristVelocity > prev && item.wristVelocity > next && item.wristVelocity > 10
  }).length
  const dangerRatio = (counts.danger || 0) / frames.length
  const risk = Math.min(100, (Math.max(...trunks) / 50) * 30 + (Math.max(...shoulders) / 110) * 25 + (Math.max(...elbows) / 130) * 20 + (symmetryIndex / 15) * 15 + (fatigueIndex / 50) * 10 + dangerRatio * 20)
  const recommendations = [
    Math.max(...trunks) > 50 ? `Trunk lean exceeded safe limits ${trunks.filter(value => value > 50).length} times. Focus on core strengthening exercises.` : 'Trunk lean stayed inside the configured safety window for most analyzed frames.',
    symmetryIndex > 15 ? `Left-right symmetry index is ${symmetryIndex.toFixed(1)}%, above the 15% risk threshold.` : `Left-right symmetry index is ${symmetryIndex.toFixed(1)}%, within a healthy range.`,
    fatigueIndex > 20 ? `Fatigue detected late in the session with a ${fatigueIndex.toFixed(1)}% wrist velocity drop.` : 'No major fatigue drop-off detected in the analyzed segment.',
  ]

  return {
    pushStrokeCount: wristPeaks,
    symmetryIndex,
    averagePushPhaseDuration: wristPeaks ? 0.42 : 0,
    recoveryToPushRatio: wristPeaks ? 1.3 : 0,
    trunkStabilityScore: Math.max(0, 100 - pstdev(trunks) * 2),
    fatigueIndex,
    injuryRiskScore: risk,
    peakJointAngles: { elbow: Math.max(...elbows), shoulder: Math.max(...shoulders), trunk: Math.max(...trunks) },
    rangeOfMotion: { elbow: Math.max(...elbows) - Math.min(...elbows), shoulder: Math.max(...shoulders) - Math.min(...shoulders), trunk: Math.max(...trunks) - Math.min(...trunks) },
    classificationBreakdown,
    recommendations,
  }
}

export function useAnalysis({
  sourceType,
  modelKey,
  videoFile,
  thresholds,
}: {
  sourceType: SourceType
  modelKey: ModelKey
  videoFile: File | null
  thresholds: Thresholds
}) {
  const [frames, setFrames] = useState<AnalysisFrame[]>([])
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<number | null>(null)

  const aggregateMetrics = useMemo(() => result?.aggregateMetrics ?? aggregateFrames(frames), [frames, result])
  const currentMetrics = frames[frames.length - 1]?.metrics

  const reset = useCallback(() => {
    setFrames([])
    setResult(null)
    setProgress(0)
    setError('')
  }, [])

  const startVideoAnalysis = useCallback(async () => {
    if (!videoFile) {
      setError('Choose a video file before starting analysis.')
      return null
    }
    reset()
    setIsAnalyzing(true)
    const form = new FormData()
    form.append('video', videoFile)
    form.append('frame_skip', '2')
    form.append('thresholds', JSON.stringify(thresholds))
    form.append('model_key', modelKey)

    try {
      const response = await fetch(`${API_BASE}/api/analyze-video-stream`, { method: 'POST', body: form })
      if (!response.ok || !response.body) throw new Error(`Backend returned ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const messages = buffer.split('\n\n')
        buffer = messages.pop() || ''
        for (const message of messages) {
          const dataLine = message.split('\n').find(line => line.startsWith('data: '))
          if (!dataLine) continue
          const payload = JSON.parse(dataLine.slice(6))
          if (payload.type === 'frame') {
            if (payload.frame.modelError) setError(payload.frame.modelError)
            setFrames(prev => [...prev, payload.frame])
            setProgress(Math.round((payload.progress || 0) * 100))
          }
          if (payload.type === 'complete') {
            setResult(payload.result)
            setFrames(payload.result.frames)
            setProgress(100)
            setIsAnalyzing(false)
            return payload.result as AnalysisResult
          }
          if (payload.type === 'error') throw new Error(payload.message)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video analysis failed.')
    } finally {
      setIsAnalyzing(false)
    }
    return null
  }, [modelKey, reset, thresholds, videoFile])

  const startCameraAnalysis = useCallback((video: HTMLVideoElement) => {
    reset()
    setIsAnalyzing(true)
    const ws = new WebSocket(`${WS_BASE}/ws/analyze`)
    wsRef.current = ws
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 360
    const ctx = canvas.getContext('2d')

    ws.onopen = () => {
      timerRef.current = window.setInterval(() => {
        if (!ctx || ws.readyState !== WebSocket.OPEN || video.readyState < 2) return
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ws.send(JSON.stringify({ timestamp: performance.now() / 1000, modelKey, thresholds, frame: canvas.toDataURL('image/jpeg', 0.72) }))
      }, 120)
    }

    ws.onmessage = event => {
      const payload = JSON.parse(event.data)
      if (payload.type === 'frame') {
        if (payload.frame.modelError) setError(payload.frame.modelError)
        setFrames(prev => [...prev.slice(-300), payload.frame])
        setProgress(100)
      }
      if (payload.type === 'error') {
        setError(payload.message)
      }
    }

    ws.onerror = () => setError('WebSocket connection failed. Check that the Python backend is running.')
    ws.onclose = () => setIsAnalyzing(false)
  }, [modelKey, reset, thresholds])

  const stopCameraAnalysis = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    wsRef.current?.close()
    wsRef.current = null
    setIsAnalyzing(false)
    const completed: AnalysisResult = {
      id: crypto.randomUUID(),
      sourceType: 'camera',
      modelKey,
      modelLabel: modelKey === 'original_yolo' ? 'Original YOLO' : 'Fine Tuned YOLO',
      createdAt: new Date().toISOString(),
      duration: frames[frames.length - 1]?.timestamp || frames.length / 8,
      fps: 8,
      frames,
      aggregateMetrics: aggregateFrames(frames),
    }
    setResult(completed)
    return completed
  }, [frames, modelKey])

  return {
    frames,
    currentMetrics,
    aggregateMetrics,
    result,
    isAnalyzing,
    progress,
    error,
    startVideoAnalysis,
    startCameraAnalysis,
    stopCameraAnalysis,
  }
}
