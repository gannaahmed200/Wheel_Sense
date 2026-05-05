import { useEffect, useRef } from 'react'
import type { AnalysisFrame, Classification } from '../contexts/AnalysisContext'

const SKELETON = [
  [5, 7],
  [7, 9],
  [6, 8],
  [8, 10],
  [5, 6],
  [5, 11],
  [6, 12],
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
]

const COLORS: Record<Classification, string> = {
  efficient: '#22c55e',
  inefficient: '#eab308',
  danger: '#ef4444',
  complete: '#3b82f6',
}

interface PoseOverlayProps {
  frame: AnalysisFrame | null
  mirrored?: boolean
}

export default function PoseOverlay({ frame, mirrored = false }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)

    if (!frame?.people?.length || !frame.width || !frame.height) return

    const scaleX = rect.width / frame.width
    const scaleY = rect.height / frame.height
    const color = COLORS[frame.metrics.classification] || COLORS.efficient

    for (const person of frame.people) {
      for (const [start, end] of SKELETON) {
        const a = person.keypoints[start]
        const b = person.keypoints[end]
        if (!a || !b || a.confidence < 0.2 || b.confidence < 0.2) continue
        const ax = mirrored ? rect.width - a.x * scaleX : a.x * scaleX
        const bx = mirrored ? rect.width - b.x * scaleX : b.x * scaleX
        ctx.beginPath()
        ctx.moveTo(ax, a.y * scaleY)
        ctx.lineTo(bx, b.y * scaleY)
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.shadowColor = color
        ctx.shadowBlur = 8
        ctx.stroke()
      }

      for (const point of person.keypoints) {
        if (point.confidence < 0.2) continue
        const x = mirrored ? rect.width - point.x * scaleX : point.x * scaleX
        const y = point.y * scaleY
        ctx.beginPath()
        ctx.arc(x, y, 4 + point.confidence * 4, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, 7, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'
        ctx.lineWidth = 1
        ctx.shadowBlur = 0
        ctx.stroke()
      }
    }
  }, [frame, mirrored])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
