import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, AnimatePresence } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import StatsCounter from '../components/StatsCounter'
import HowItWorks from '../components/HowItWorks'
import SkeletonHero from '../components/SkeletonHero'

// ─── Page transition ──────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6 } },
  exit:    { opacity: 0, transition: { duration: 0.3 } },
}

// ─── WebGL probe (same as SkeletonParticles) ──────────────────────────────────
function probeWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    c.width = 2; c.height = 2
    const r = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: false })
    const ctx = r.getContext()
    r.dispose()
    return ctx != null
  } catch { return false }
}

// ─── Court-line SVG backdrop ──────────────────────────────────────────────────
function CourtLines() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05, pointerEvents: 'none' }}
      viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice">
      <rect x="60" y="40" width="1160" height="640" fill="none" stroke="#FF5A1F" strokeWidth="2" />
      <line x1="640" y1="40" x2="640" y2="680" stroke="#FF5A1F" strokeWidth="1.5" />
      <circle cx="640" cy="360" r="120" fill="none" stroke="#FF5A1F" strokeWidth="1.5" />
      <circle cx="640" cy="360" r="5" fill="#FF5A1F" />
      <rect x="60"  y="195" width="215" height="330" fill="none" stroke="#FF5A1F" strokeWidth="1.5" />
      <rect x="1005" y="195" width="215" height="330" fill="none" stroke="#FF5A1F" strokeWidth="1.5" />
      <path d="M 60 160 Q 370 360 60 560"  fill="none" stroke="#FF5A1F" strokeWidth="1.5" />
      <path d="M 1220 160 Q 910 360 1220 560" fill="none" stroke="#FF5A1F" strokeWidth="1.5" />
    </svg>
  )
}

// ─── Act content definitions ──────────────────────────────────────────────────
const ACTS = {
  1: {
    tag:   'PARALYMPIC PERFORMANCE ANALYSIS',
    lines: ['WHEEL', 'TRACK'],
    sub:   'Real-time biomechanics analysis and injury prevention for Paralympic wheelchair basketball athletes.',
    cta:   true,
  },
  2: {
    tag:   'STAGE 1 — DETECTION',
    lines: ['AI DETECTS', '33 KEYPOINTS'],
    sub:   'MediaPipe BlazePose maps every joint on the athlete\'s body in real-time. No wearables. No sensors. Just a camera.',
    cta:   false,
  },
  3: {
    tag:   'STAGE 2 — ANALYSIS',
    lines: ['BIOMECHANICS', 'EXTRACTED'],
    sub:   'Elbow flexion. Shoulder abduction. Trunk rotation. Calculated frame by frame at 30fps. Injury detected before it happens.',
    cta:   false,
  },
} as const

// ─── Left-side act text ───────────────────────────────────────────────────────
function ActText({
  scrollProgress,
  navigate,
}: {
  scrollProgress: MotionValue<number>
  navigate: ReturnType<typeof useNavigate>
}) {
  const [act, setAct] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    return scrollProgress.on('change', v => {
      if (v < 0.33) setAct(1)
      else if (v < 0.66) setAct(2)
      else setAct(3)
    })
  }, [scrollProgress])

  const data = ACTS[act]

  return (
    <div style={{ flex: '0 0 48%', padding: '0 3.5rem', zIndex: 10, position: 'relative' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={act}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.48 }}
        >
          {/* Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 2, background: '#FF5A1F', borderRadius: 1, flexShrink: 0 }} />
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.22em', color: '#FF5A1F', textTransform: 'uppercase',
            }}>
              {data.tag}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(3.5rem, 7vw, 6.8rem)',
            lineHeight: 0.95, margin: '0 0 1.5rem',
            letterSpacing: '0.06em',
          }}>
            <span style={{ color: '#ffffff', display: 'block' }}>{data.lines[0]}</span>
            <span style={{ color: '#FF5A1F', display: 'block' }}>{data.lines[1]}</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '1rem', color: '#888880',
            lineHeight: 1.75, maxWidth: '26rem', margin: '0 0 2rem',
          }}>
            {data.sub}
          </p>

          {/* CTAs — Act 1 only */}
          {data.cta && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <motion.button
                onClick={() => navigate('/configure')}
                style={{
                  padding: '0.9rem 2rem', background: '#FF5A1F', color: '#fff',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: '1.05rem',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  borderRadius: '9999px', border: 'none', cursor: 'pointer',
                  boxShadow: '0 0 28px rgba(255,90,31,0.35)',
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,90,31,0.55)' } as any}
                whileTap={{ scale: 0.97 }}
              >
                Start Analysis
              </motion.button>
              <motion.button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '0.9rem 2rem', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.22)', color: '#ccc',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: '1.05rem',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  borderRadius: '9999px', backdropFilter: 'blur(8px)', cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05, borderColor: 'rgba(255,90,31,0.5)' } as any}
                whileTap={{ scale: 0.97 }}
              >
                Learn More
              </motion.button>
            </div>
          )}

          {/* Scroll hint — Act 1 */}
          {act === 1 && (
            <motion.div
              style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: 8 }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.69rem',
                color: '#444440', letterSpacing: '0.22em', textTransform: 'uppercase',
              }}>
                Scroll to explore
              </span>
              <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, #FF5A1F, transparent)' }} />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Act dots */}
      <div style={{ position: 'absolute', bottom: '2.5rem', left: '3.5rem', display: 'flex', gap: 8 }}>
        {([1, 2, 3] as const).map(i => (
          <div key={i} style={{
            width: i === act ? 22 : 6, height: 6, borderRadius: 3,
            background: i === act ? '#FF5A1F' : '#333',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Three.js scene builder (called from useEffect) ───────────────────────────
function buildScene(
  canvas: HTMLCanvasElement,
  scrollRef: React.MutableRefObject<number>,
): () => void {
  const W = canvas.offsetWidth || canvas.clientWidth || 640
  const H = canvas.offsetHeight || canvas.clientHeight || 720

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(W, H, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.08)

  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
  camera.position.set(0, 1.8, 5.5)
  camera.lookAt(0, 1.2, 0)

  // ── Helpers ────────────────────────────────────────────────────────────────
  function mat(color: number, rough = 0.6, metal = 0.1) {
    return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
  }

  function tube(
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
    r = 0.025, col = 0x888888,
  ) {
    const dir = new THREE.Vector3(x2 - x1, y2 - y1, z2 - z1)
    const len = dir.length()
    const mid = new THREE.Vector3((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2)
    const g = new THREE.CylinderGeometry(r, r, len, 8)
    const m = new THREE.Mesh(g, mat(col, 0.3, 0.7))
    m.position.copy(mid)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
    m.castShadow = true
    return m
  }

  const group = new THREE.Group()

  // ── Wheelchair frame ───────────────────────────────────────────────────────
  const wFrame = new THREE.Group()
  wFrame.add(tube(-0.45,0.55,0,      0.45,0.55,0,      0.02, 0x999999))
  wFrame.add(tube(-0.45,0.55,-0.38,  0.45,0.55,-0.38,  0.02, 0x999999))
  wFrame.add(tube(-0.45,0.55,0,     -0.45,0.55,-0.38,  0.02, 0x999999))
  wFrame.add(tube( 0.45,0.55,0,      0.45,0.55,-0.38,  0.02, 0x999999))
  wFrame.add(tube(-0.42,0.55,-0.38, -0.42,1.1,-0.38,  0.025, 0x888888))
  wFrame.add(tube( 0.42,0.55,-0.38,  0.42,1.1,-0.38,  0.025, 0x888888))
  wFrame.add(tube(-0.42,1.1,-0.38,   0.42,1.1,-0.38,  0.02,  0x888888))
  wFrame.add(tube(-0.42,0.55,0,     -0.42,0,-0.15,    0.025, 0x777777))
  wFrame.add(tube( 0.42,0.55,0,      0.42,0,-0.15,    0.025, 0x777777))
  wFrame.add(tube(-0.42,0.55,-0.38, -0.42,0,-0.15,    0.02,  0x777777))
  wFrame.add(tube( 0.42,0.55,-0.38,  0.42,0,-0.15,    0.02,  0x777777))
  wFrame.add(tube(-0.42,0,-0.15,     0.42,0,-0.15,    0.02,  0x777777))
  wFrame.add(tube(-0.25,0.55,0.05,  -0.25,0.1,0.4,    0.02,  0x888888))
  wFrame.add(tube( 0.25,0.55,0.05,   0.25,0.1,0.4,    0.02,  0x888888))
  wFrame.add(tube(-0.28,0.12,0.42,   0.28,0.12,0.42,  0.025, 0x999999))

  const seatCush = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.06, 0.38), mat(0x222222, 0.9, 0))
  seatCush.position.set(0, 0.58, -0.19)
  wFrame.add(seatCush)

  const backCush = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.5, 0.04), mat(0x1a1a1a, 0.9, 0))
  backCush.position.set(0, 0.84, -0.37)
  wFrame.add(backCush)

  function bigWheel(x: number) {
    const wg = new THREE.Group()
    const r = 0.52
    const tire = new THREE.Mesh(new THREE.TorusGeometry(r, 0.055, 12, 48), mat(0x1a1a1a, 0.9, 0.1))
    tire.castShadow = true
    wg.add(tire)
    wg.add(new THREE.Mesh(new THREE.TorusGeometry(r - 0.07, 0.018, 8, 48), mat(0xFF5A1F, 0.4, 0.6)))
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 16), mat(0xcccccc, 0.2, 0.9))
    hub.rotation.x = Math.PI / 2
    wg.add(hub)
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, r * 0.96, 4),
        mat(0xaaaaaa, 0.3, 0.7),
      )
      spoke.position.set(Math.cos(angle) * r / 2, Math.sin(angle) * r / 2, 0)
      spoke.rotation.z = angle + Math.PI / 2
      wg.add(spoke)
    }
    wg.rotation.y = Math.PI / 2
    wg.position.set(x, 0.52, -0.15)
    return wg
  }

  wFrame.add(bigWheel(-0.52))
  wFrame.add(bigWheel( 0.52))

  function caster(x: number, z: number) {
    const cg = new THREE.Group()
    cg.add(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 24), mat(0x222222, 0.9, 0)))
    cg.rotation.y = Math.PI / 2
    cg.position.set(x, 0.1, z)
    return cg
  }
  wFrame.add(caster(-0.3, 0.5))
  wFrame.add(caster( 0.3, 0.5))
  group.add(wFrame)

  // ── Athlete body ───────────────────────────────────────────────────────────
  const athleteMeshes: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] = []
  const athleteGroup = new THREE.Group()

  function addA(mesh: THREE.Mesh) {
    mesh.castShadow = true
    const m = mesh.material as THREE.MeshStandardMaterial
    m.transparent = true
    m.opacity = 1
    athleteMeshes.push(mesh as any)
    athleteGroup.add(mesh)
    return mesh
  }

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 0.55, 12), mat(0xFF5A1F, 0.7, 0))
  torso.position.set(0, 1.0, -0.15)
  addA(torso)

  const jerseyStripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.01), mat(0xffffff, 0.8, 0))
  jerseyStripe.position.set(0, 1.02, 0.21)
  addA(jerseyStripe)

  for (const x of [-0.3, 0.3]) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), mat(0xFF5A1F, 0.7, 0))
    s.position.set(x, 1.22, -0.1)
    addA(s)
  }

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), mat(0xD4956A, 0.7, 0.05))
  head.position.set(0, 1.62, -0.08)
  addA(head)

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.195, 16, 16), mat(0x111111, 0.8, 0.1))
  helmet.position.set(0, 1.67, -0.1)
  helmet.scale.set(1, 0.6, 1)
  addA(helmet)

  for (const x of [-0.07, 0.07]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), mat(0x111111, 0.5, 0))
    e.position.set(x, 1.63, 0.12)
    addA(e)
  }

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.12, 10), mat(0xD4956A, 0.7, 0))
  neck.position.set(0, 1.48, -0.06)
  addA(neck)

  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), mat(0xB87040, 0.7, 0))
  nose.position.set(0, 1.57, 0.175)
  addA(nose)

  // Right arm — up for shooting
  const rUA = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.32, 10), mat(0xFF5A1F, 0.7, 0))
  rUA.position.set(0.45, 1.32, -0.042)
  rUA.rotation.z = -Math.PI / 4.5; rUA.rotation.x = -0.3
  addA(rUA)

  const rFA = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.3, 10), mat(0xD4956A, 0.7, 0))
  rFA.position.set(0.6, 1.52, -0.05)
  rFA.rotation.z = -0.55; rFA.rotation.x = -0.15
  addA(rFA)

  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), mat(0xD4956A, 0.7, 0))
  rHand.position.set(0.72, 1.7, -0.1)
  addA(rHand)

  // Left arm — reaching forward for ball
  const lUA = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.32, 10), mat(0xD4956A, 0.7, 0))
  lUA.position.set(-0.42, 1.15, 0.05)
  lUA.rotation.z = Math.PI / 5.5; lUA.rotation.x = -300000.94
  addA(lUA)

  const lFA = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.3, 10), mat(0xD4956A, 0.7, 0))
  lFA.position.set(-0.62, 0.98, 0.22)
  lFA.rotation.z = 40000 / 2.8; lFA.rotation.x = -1800.8
  addA(lFA)

  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), mat(0xD4956A, 0.7, 0))
  lHand.position.set(-0.78, 0.85, 0.38)
  addA(lHand)

  for (const x of [-0.22, 0.22]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.38, 10), mat(0x1a1a1a, 0.8, 0))
    t.position.set(x, 0.68, 0.08); t.rotation.x = Math.PI / 2.2
    addA(t)
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.3, 10), mat(0xD4956A, 0.7, 0))
    s.position.set(x, 0.48, 0.3); s.rotation.x = -0.4
    addA(s)
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.28), mat(0x111111, 0.9, 0))
    sole.position.set(x, 0.19, 0.45); addA(sole)
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.24), mat(0xffffff, 0.7, 0))
    upper.position.set(x, 0.25, 0.44); addA(upper)
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.025, 0.26), mat(0xFF5A1F, 0.6, 0))
    stripe.position.set(x, 0.22, 0.44); addA(stripe)
  }

  group.add(athleteGroup)

  // ── Basketball ─────────────────────────────────────────────────────────────
  const ballGroup = new THREE.Group()
  const ballCore = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), mat(0xD4581A, 0.6, 0.05))
  ballGroup.add(ballCore)
  for (let i = 0; i < 3; i++) {
    const seam = new THREE.Mesh(
      new THREE.TorusGeometry(0.162, 0.006, 6, 32),
      mat(0x1a1a1a, 0.9, 0),
    )
    seam.rotation.y = (i / 3) * Math.PI
    ballGroup.add(seam)
  }
  ballGroup.position.set(0.88, 1.88, -0.05)
  group.add(ballGroup)

  // ── Ground elements ────────────────────────────────────────────────────────
  const shadowPlane = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 32),
    new THREE.MeshBasicMaterial({ color: 0xFF5A1F, transparent: true, opacity: 0.05 }),
  )
  shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.y = -0.01
  group.add(shadowPlane)

  const courtRing = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 1.15, 48),
    new THREE.MeshBasicMaterial({ color: 0xFF5A1F, transparent: true, opacity: 0.15, side: THREE.DoubleSide }),
  )
  courtRing.rotation.x = -Math.PI / 2
  group.add(courtRing)

  // ── Keypoint spheres (Act 2+) ──────────────────────────────────────────────
  const keypointPositions: [number, number, number][] = [
    [ 0,     1.62,  0.05],  // 0: head
    [-0.32,  1.22,  0.05],  // 1: L shoulder
    [ 0.32,  1.22,  0.05],  // 2: R shoulder
    [-0.55,  1.07,  0.18],  // 3: L elbow
    [ 0.55,  1.42,  0.05],  // 4: R elbow
    [-0.78,  0.85,  0.42],  // 5: L wrist
    [ 0.72,  1.7,   0.05],  // 6: R wrist
    [-0.22,  0.65,  0.18],  // 7: L hip
    [ 0.22,  0.65,  0.18],  // 8: R hip
    [-0.22,  0.45,  0.42],  // 9: L knee
    [ 0.22,  0.45,  0.42],  // 10: R knee
    [ 0,     1.48,  0.05],  // 11: neck
    [ 0,     1.02,  0.05],  // 12: chest
  ]

  type KpMesh = THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  const keypointSpheres: KpMesh[] = keypointPositions.map(pos => {
    const sp = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0xFF5A1F, emissive: 0xFF5A1F,
        emissiveIntensity: 0.8, transparent: true, opacity: 0,
        depthTest: false, depthWrite: false,
      }),
    ) as KpMesh
    sp.renderOrder = 999
    sp.position.set(pos[0], pos[1], pos[2])
    group.add(sp)
    return sp
  })

  // ── Skeleton lines (Act 2+) ────────────────────────────────────────────────
  const skeletonConnections: [number, number][] = [
    [0,11],          // head → neck
    [11,1],[11,2],   // neck → shoulders
    [1,2],           // L shoulder ↔ R shoulder
    [1,3],[2,4],     // shoulders → elbows
    [3,5],[4,6],     // elbows → wrists
    [11,12],         // neck → chest (spine)
    [12,7],[12,8],   // chest → hips
    [7,8],           // L hip ↔ R hip
    [7,9],[8,10],    // hips → knees
  ]

  type SkLine = THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>
  const skeletonLines: SkLine[] = skeletonConnections.map(([a, b]) => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...keypointPositions[a]),
      new THREE.Vector3(...keypointPositions[b]),
    ])
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: 0xFF5A1F, transparent: true, opacity: 0, depthTest: false }),
    ) as SkLine
    line.renderOrder = 998
    group.add(line)
    return line
  })

  // ── Wireframe (Act 3) ──────────────────────────────────────────────────────
  type WireMesh = THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>
  const wireframeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.6, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xFF5A1F, wireframe: true, transparent: true, opacity: 0 }),
  ) as WireMesh
  wireframeMesh.position.set(0, 0.7, -0.15)
  group.add(wireframeMesh)

  // ── Ambient particles ──────────────────────────────────────────────────────
  const pGeo = new THREE.BufferGeometry()
  const pPos = new Float32Array(80 * 3)
  for (let i = 0; i < 80; i++) {
    pPos[i * 3]     = (Math.random() - 0.5) * 6
    pPos[i * 3 + 1] = Math.random() * 4
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xFF5A1F, size: 0.025, transparent: true, opacity: 0.4 })))

  // ── Lighting ───────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
  keyLight.position.set(3, 5, 3); keyLight.castShadow = true
  scene.add(keyLight)
  const rimLight = new THREE.PointLight(0xFF5A1F, 3, 8)
  rimLight.position.set(-2, 3, -1); scene.add(rimLight)
  const fillLight = new THREE.PointLight(0xFF8C60, 1.5, 10)
  fillLight.position.set(2, 2, 3); scene.add(fillLight)
  const backLight = new THREE.PointLight(0xFF5A1F, 2, 6)
  backLight.position.set(0, 4, -3); scene.add(backLight)

  scene.add(group)

  // ── Mouse ──────────────────────────────────────────────────────────────────
  let mouseX = 0, mouseY = 0
  const onMouseMove = (e: MouseEvent) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2
  }
  window.addEventListener('mousemove', onMouseMove)

  // ── Lerp helper ────────────────────────────────────────────────────────────
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

  // ── Animation loop ─────────────────────────────────────────────────────────
  let time = 0
  let animId = 0
  const kpOpacities = new Array(keypointSpheres.length).fill(0) as number[]

  function animate() {
    animId = requestAnimationFrame(animate)
    time += 0.012

    const s = scrollRef.current

    // Mouse follow
    group.rotation.y += (mouseX * 0.5  - group.rotation.y) * 0.05
    group.rotation.x += (mouseY * 0.08 - group.rotation.x) * 0.05

    // Breathing
    group.position.y = Math.sin(time * 0.8) * 0.02

    // Ball
    ballGroup.position.y = 1.88 + Math.abs(Math.sin(time * 1.4)) * 0.08
    ballGroup.rotation.y = time * 1.5

    // Rim light pulse
    rimLight.intensity = 2.5 + Math.sin(time * 2) * 0.5

    // Act 2: keypoints + lines (scroll 0.15→0.40)
    const act2 = clamp((s - 0.15) / 0.25, 0, 1)

    keypointSpheres.forEach((sp, i) => {
      const delay = i / keypointSpheres.length
      const target = act2 > delay ? clamp((act2 - delay) * 5, 0, 1) : 0
      kpOpacities[i] = lerp(kpOpacities[i], target, 0.08)
      sp.material.opacity = kpOpacities[i]
      sp.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.08 * act2)
    })

    skeletonLines.forEach((line, i) => {
      const delay = (i / skeletonLines.length) * 0.5
      const target = act2 > delay ? clamp((act2 - delay) * 3, 0, 0.7) : 0
      line.material.opacity = lerp(line.material.opacity, target, 0.05)
    })

    // Act 3: athlete fades, wireframe appears (scroll 0.50→0.75)
    const act3 = clamp((s - 0.50) / 0.25, 0, 1)

    athleteMeshes.forEach(mesh => {
      mesh.material.opacity = lerp(mesh.material.opacity, 1 - act3, 0.05)
    })

    wireframeMesh.material.opacity = lerp(wireframeMesh.material.opacity, act3 * 0.6, 0.05)

    keypointSpheres.forEach(sp => {
      sp.material.emissiveIntensity = lerp(sp.material.emissiveIntensity, 0.8 + act3 * 2, 0.05)
    })

    ballGroup.children.forEach(child => {
      const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
      if (m) { m.transparent = true; m.opacity = lerp(m.opacity ?? 1, 1 - act3 * 0.7, 0.05) }
    })

    renderer.render(scene, camera)
  }

  animate()

  // ── Resize handler ──────────────────────────────────────────────────────────
  const onResize = () => {
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (w && h) {
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
  }
  window.addEventListener('resize', onResize)

  return () => {
    cancelAnimationFrame(animId)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
  }
}

// ─── Main Home component ──────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()
  const heroWrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const scrollRef      = useRef(0)

  // Probe once, synchronously
  const [webgl] = useState<boolean>(() => probeWebGL())

  const { scrollYProgress } = useScroll({
    target: heroWrapperRef,
    offset: ['start start', 'end end'],
  })

  // Keep scrollRef in sync with Framer Motion scroll progress
  useEffect(() => {
    return scrollYProgress.on('change', v => { scrollRef.current = v })
  }, [scrollYProgress])

  // Build Three.js scene after mount (only when WebGL available)
  useEffect(() => {
    if (!webgl) return
    const canvas = canvasRef.current
    if (!canvas) return
    return buildScene(canvas, scrollRef)
  }, [webgl])

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">

      {/* ── STICKY HERO WRAPPER — 300vh scroll space ─────────────────────── */}
      <div ref={heroWrapperRef} style={{ height: '300vh', position: 'relative' }}>

        {/* ── STICKY PANEL ─────────────────────────────────────────────────── */}
        <div style={{
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', alignItems: 'center',
          background: '#0a0a0a', overflow: 'hidden',
        }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 90% at 72% 52%, rgba(255,90,31,0.09) 0%, #0a0a0a 60%)',
            pointerEvents: 'none',
          }} />
          <CourtLines />

          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%',
            background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
            zIndex: 2, pointerEvents: 'none',
          }} />

          {/* Left: act text */}
          <ActText scrollProgress={scrollYProgress} navigate={navigate} />

          {/* Right: Three.js canvas or SVG fallback */}
          <div style={{ flex: '0 0 52%', height: '100%', position: 'relative' }}>
            {webgl ? (
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            ) : (
              <SkeletonHero />
            )}
          </div>
        </div>
      </div>

      <StatsCounter />
      <HowItWorks id="about" />

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#444440', fontSize: '0.875rem' }}>
          Team 4 &nbsp;·&nbsp; Dr. Aliaa Rehan &nbsp;·&nbsp; Eng. Amira Omar &nbsp;·&nbsp; Eng. Alaa Tarek
        </p>
      </footer>
    </motion.div>
  )
}
