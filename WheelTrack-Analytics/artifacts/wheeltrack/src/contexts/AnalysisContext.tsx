import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type SourceType = 'video' | 'camera'
export type Classification = 'efficient' | 'inefficient' | 'danger' | 'complete'
export type ModelKey = 'fine_tuned_yolo' | 'original_yolo'

export type Thresholds = {
  elbow: { warn: number; danger: number }
  shoulder: { warn: number; danger: number }
  trunk: { warn: number; danger: number }
}

export type PoseKeypoint = {
  name: string
  x: number
  y: number
  confidence: number
}

export type PersonKeypoints = {
  keypoints: PoseKeypoint[]
  confidence: number
  bbox?: number[]
}

export type FrameMetrics = {
  elbow: number
  shoulder: number
  trunk: number
  leftElbow: number
  rightElbow: number
  leftShoulder: number
  rightShoulder: number
  wristVelocity: number
  shoulderElevation: number
  classification: Classification
  confidence: number
  courtPosition?: { x: number; y: number }
}

export type AnalysisFrame = {
  frameIndex?: number
  timestamp: number
  modelKey?: ModelKey
  modelLabel?: string
  people: PersonKeypoints[]
  metrics: FrameMetrics
  annotatedFrame?: string
  modelError?: string
  width?: number
  height?: number
}

export type AggregateMetrics = {
  pushStrokeCount: number
  symmetryIndex: number
  averagePushPhaseDuration: number
  recoveryToPushRatio: number
  trunkStabilityScore: number
  fatigueIndex: number
  injuryRiskScore: number
  peakJointAngles: { elbow: number; shoulder: number; trunk: number }
  rangeOfMotion: { elbow: number; shoulder: number; trunk: number }
  classificationBreakdown: Record<string, number>
  recommendations: string[]
}

export type AnalysisResult = {
  id: string
  sourceType: SourceType
  modelKey?: ModelKey
  modelLabel?: string
  createdAt: string
  fileName?: string
  duration: number
  fps: number
  frameSkip?: number
  frames: AnalysisFrame[]
  aggregateMetrics: AggregateMetrics
}

type AnalysisContextValue = {
  sourceType: SourceType
  modelKey: ModelKey
  videoFile: File | null
  thresholds: Thresholds
  analysisResults: AnalysisResult | null
  sessionHistory: AnalysisResult[]
  setSourceType: (sourceType: SourceType) => void
  setModelKey: (modelKey: ModelKey) => void
  setVideoFile: (file: File | null) => void
  setThresholds: (thresholds: Thresholds) => void
  setAnalysisResults: (result: AnalysisResult | null) => void
  addSessionResult: (result: AnalysisResult) => void
}

const DEFAULT_THRESHOLDS: Thresholds = {
  elbow: { warn: 100, danger: 130 },
  shoulder: { warn: 80, danger: 110 },
  trunk: { warn: 30, danger: 50 },
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [sourceType, setSourceType] = useState<SourceType>('video')
  const [modelKey, setModelKey] = useState<ModelKey>('fine_tuned_yolo')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null)
  const [sessionHistory, setSessionHistory] = useState<AnalysisResult[]>([])

  const addSessionResult = useCallback((result: AnalysisResult) => {
    setAnalysisResults(result)
    setSessionHistory(prev => {
      const next = [result, ...prev.filter(item => item.id !== result.id)]
      return next.slice(0, 12)
    })
  }, [])

  const value = useMemo(
    () => ({
      sourceType,
      modelKey,
      videoFile,
      thresholds,
      analysisResults,
      sessionHistory,
      setSourceType,
      setModelKey,
      setVideoFile,
      setThresholds,
      setAnalysisResults,
      addSessionResult,
    }),
    [sourceType, modelKey, videoFile, thresholds, analysisResults, sessionHistory, addSessionResult],
  )

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
}

export function useAnalysisContext() {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error('useAnalysisContext must be used within AnalysisProvider')
  }
  return context
}
