// Basketball3D — uses Google model-viewer web component to display
// a real GLTF basketball model loaded from a public CDN.
// Falls back gracefully to a CSS 3D sphere if WebGL is unavailable.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Tell TypeScript about the model-viewer custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          alt?: string
          'auto-rotate'?: boolean | string
          'auto-rotate-delay'?: string
          'rotation-per-second'?: string
          'camera-controls'?: boolean | string
          'environment-image'?: string
          exposure?: string
          'shadow-intensity'?: string
          poster?: string
          loading?: string
          reveal?: string
          style?: React.CSSProperties
          ar?: boolean | string
        },
        HTMLElement
      >
    }
  }
}

// CSS fallback basketball (shown while model loads or if WebGL is blocked)
function CSSBasketball({ size }: { size: number }) {
  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={{ rotateY: 360, rotateX: [0, 5, -5, 0] }}
      transition={{ rotateY: { duration: 4, repeat: Infinity, ease: 'linear' }, rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
    >
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #f07020 0%, #d05000 45%, #8b2f00 80%, #2a0d00 100%)',
        boxShadow: '-10px 12px 40px rgba(0,0,0,0.8), inset -6px -8px 18px rgba(0,0,0,0.4), inset 4px 4px 12px rgba(255,160,60,0.3)',
        position: 'relative', overflow: 'hidden',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1a0700" strokeWidth="3" opacity="0.85" />
          <path d="M50 -5 Q78 22 78 50 Q78 78 50 105" fill="none" stroke="#1a0700" strokeWidth="2.5" opacity="0.85" />
          <path d="M50 -5 Q22 22 22 50 Q22 78 50 105" fill="none" stroke="#1a0700" strokeWidth="2.5" opacity="0.85" />
          <path d="M -5 50 Q22 30 50 50 Q78 70 105 50" fill="none" stroke="#1a0700" strokeWidth="2.5" opacity="0.85" />
        </svg>
        <div style={{ position: 'absolute', top: '15%', left: '18%', width: '28%', height: '20%', borderRadius: '50%', background: 'rgba(255,190,80,0.2)', filter: 'blur(7px)' }} />
      </div>
    </motion.div>
  )
}

interface Basketball3DProps {
  size?: number
  style?: React.CSSProperties
}

export default function Basketball3D({ size = 200, style }: Basketball3DProps) {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelError, setModelError] = useState(false)
  const viewerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = viewerRef.current as any
    if (!el) return
    const onLoad = () => setModelLoaded(true)
    const onError = () => setModelError(true)
    el.addEventListener('load', onLoad)
    el.addEventListener('error', onError)
    return () => {
      el.removeEventListener('load', onLoad)
      el.removeEventListener('error', onError)
    }
  }, [])

  const showFallback = modelError

  return (
    <div style={{ width: size, height: size, position: 'relative', ...style }}>
      {/* Real 3D model via model-viewer */}
      {!showFallback && (
        <model-viewer
          ref={viewerRef as any}
          src="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/basketball/model.gltf"
          alt="3D Basketball"
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="40deg"
          camera-controls
          exposure="0.9"
          shadow-intensity="0.8"
          loading="eager"
          reveal="auto"
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            display: modelLoaded ? 'block' : 'none',
            '--progress-bar-color': 'transparent',
          } as React.CSSProperties}
        />
      )}

      {/* Loading / fallback state */}
      {(!modelLoaded || showFallback) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CSSBasketball size={size} />
        </div>
      )}
    </div>
  )
}
