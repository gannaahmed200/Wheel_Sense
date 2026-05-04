// CourtHeatmap — HTML Canvas 2D top-down basketball court with live position trail.
// No WebGL required. Updates every frame with simulated athlete positions.
import { useEffect, useRef, useCallback } from 'react'

interface Props {
  elbow: number
  shoulder: number
  trunk: number
  classification: string
}

// ─── Court geometry constants (in canvas pixels) ─────────────────────────────
const CW = 620, CH = 390   // canvas logical size
const M  = 18              // margin

// Draw the court lines (called once on mount, redrawn on resize)
function drawCourt(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CW, CH)
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'
  ctx.lineWidth   = 1.5

  // Outer boundary
  ctx.strokeRect(M, M, CW - M * 2, CH - M * 2)

  // Half-court line
  ctx.beginPath()
  ctx.moveTo(CW / 2, M)
  ctx.lineTo(CW / 2, CH - M)
  ctx.stroke()

  // Centre circle
  ctx.beginPath()
  ctx.arc(CW / 2, CH / 2, 52, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(CW / 2, CH / 2, 3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fill()

  // Left paint / key
  ctx.strokeRect(M, CH / 2 - 68, 138, 136)

  // Right paint / key
  ctx.strokeRect(CW - M - 138, CH / 2 - 68, 138, 136)

  // Left free-throw circle
  ctx.beginPath()
  ctx.arc(M + 138, CH / 2, 52, 0, Math.PI * 2)
  ctx.stroke()

  // Right free-throw circle
  ctx.beginPath()
  ctx.arc(CW - M - 138, CH / 2, 52, 0, Math.PI * 2)
  ctx.stroke()

  // Left 3-point arc
  ctx.beginPath()
  ctx.arc(M, CH / 2, 150, -Math.PI / 2.4, Math.PI / 2.4)
  ctx.stroke()

  // Right 3-point arc
  ctx.beginPath()
  ctx.arc(CW - M, CH / 2, 150, Math.PI / 2 + Math.PI / 3.5, Math.PI * 1.5 - Math.PI / 3.5)
  ctx.stroke()

  // Left basket
  ctx.beginPath()
  ctx.arc(M + 18, CH / 2, 10, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,90,31,0.4)'
  ctx.stroke()

  // Right basket
  ctx.beginPath()
  ctx.arc(CW - M - 18, CH / 2, 10, 0, Math.PI * 2)
  ctx.stroke()

  // Wheelchair basketball restricted arc (left)
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.arc(M + 18, CH / 2, 38, -Math.PI * 0.45, Math.PI * 0.45)
  ctx.stroke()

  // Wheelchair basketball restricted arc (right)
  ctx.beginPath()
  ctx.arc(CW - M - 18, CH / 2, 38, Math.PI * 0.55, Math.PI * 1.45)
  ctx.stroke()
}

// ─── Position trail state ─────────────────────────────────────────────────────
const TRAIL_LEN = 40

function elbowToCoord(elbow: number, shoulder: number, tick: number): { x: number; y: number } {
  // Map biomechanics data to a realistic court position
  // Athlete operates mostly in one half; we use left half
  const baseX = M + 80 + (elbow / 160) * (CW / 2 - M - 80)
  const baseY = M + 40 + (shoulder / 140) * (CH - M * 2 - 80)
  // Add small random drift to simulate real movement
  const jitter = 6
  return {
    x: baseX + (Math.random() - 0.5) * jitter,
    y: baseY + (Math.random() - 0.5) * jitter,
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CourtHeatmap({ elbow, shoulder, trunk, classification }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef  = useRef<{ x: number; y: number }[]>([])
  const tickRef   = useRef(0)

  const classColor = {
    efficient:   'rgba(34,197,94,',
    inefficient: 'rgba(234,179,8,',
    danger:      'rgba(239,68,68,',
    complete:    'rgba(59,130,246,',
  }[classification] ?? 'rgba(255,90,31,'

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawCourt(ctx)

    const trail = trailRef.current

    // Draw trail (oldest = most transparent)
    trail.forEach((pos, i) => {
      const progress = i / trail.length         // 0 = oldest, 1 = newest
      const alpha    = progress * 0.9
      const radius   = 4 + progress * 10

      // Heatmap blob gradient
      const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 2.5)
      grad.addColorStop(0,   `${classColor}${alpha.toFixed(2)})`)
      grad.addColorStop(0.5, `${classColor}${(alpha * 0.45).toFixed(2)})`)
      grad.addColorStop(1,   `${classColor}0)`)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, radius * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Solid centre dot
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, Math.max(2, radius * 0.4), 0, Math.PI * 2)
      ctx.fillStyle = `${classColor}${(alpha * 0.85).toFixed(2)})`
      ctx.fill()
    })

    // Draw connection path between trail points
    if (trail.length > 2) {
      ctx.beginPath()
      ctx.moveTo(trail[0].x, trail[0].y)
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y)
      }
      ctx.strokeStyle = `${classColor}0.2)`
      ctx.lineWidth   = 1.5
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Newest position: bright pulsing dot
    if (trail.length > 0) {
      const last = trail[trail.length - 1]
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 280)

      ctx.beginPath()
      ctx.arc(last.x, last.y, 10 + pulse * 5, 0, Math.PI * 2)
      ctx.fillStyle = `${classColor}${(0.15 * pulse).toFixed(2)})`
      ctx.fill()

      ctx.beginPath()
      ctx.arc(last.x, last.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = `${classColor}0.95)`
      ctx.fill()

      // White centre
      ctx.beginPath()
      ctx.arc(last.x, last.y, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.fill()
    }

    // Trunk angle danger zone overlay
    if (trunk > 35) {
      ctx.fillStyle = `rgba(239,68,68,${Math.min(0.08, (trunk - 35) / 300)})`
      ctx.fillRect(M, M, CW - M * 2, CH - M * 2)
    }
  }, [classColor, trunk])

  // Push new position into trail on each data update
  useEffect(() => {
    tickRef.current++
    const pos = elbowToCoord(elbow, shoulder, tickRef.current)
    trailRef.current = [...trailRef.current.slice(-TRAIL_LEN + 1), pos]
    draw()
  }, [elbow, shoulder, draw])

  // RAF for pulse animation
  useEffect(() => {
    let id: number
    const loop = () => { draw(); id = requestAnimationFrame(loop) }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [draw])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        style={{
          width: '100%', height: '100%',
          objectFit: 'contain',
          borderRadius: '0.5rem',
        }}
      />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '1rem', right: '1rem',
        display: 'flex', flexDirection: 'column', gap: '0.3rem',
        padding: '0.5rem 0.75rem',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.65rem', letterSpacing: '0.12em', color: '#888880', textTransform: 'uppercase' }}>
          Position Trail
        </span>
        {[
          { color: '#22c55e', label: 'Efficient' },
          { color: '#eab308', label: 'Inefficient' },
          { color: '#ef4444', label: 'Danger' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: '#888880' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Corner info */}
      <div style={{
        position: 'absolute', top: '0.75rem', right: '0.75rem',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: '0.65rem', letterSpacing: '0.12em',
        color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
      }}>
        Top-Down Court View
      </div>
    </div>
  )
}
