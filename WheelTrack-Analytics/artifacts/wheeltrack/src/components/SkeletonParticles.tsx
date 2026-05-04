// SkeletonParticles — Three.js/@react-three/fiber particle skeleton.
//
// Uses THREE.WebGLRenderer itself as the capability check: if it fails to
// initialize, we know R3F Canvas will also fail, so we show the SVG fallback
// instead — without ever triggering the Vite error overlay.
import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SkeletonHero from './SkeletonHero'

// ─── Definitive WebGL check ───────────────────────────────────────────────────
// THREE.WebGLRenderer does NOT throw on context failure — it just logs and
// continues with a null internal context. We probe by creating a renderer and
// then checking renderer.getContext() — null means WebGL is unavailable.
function probeWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 2
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    const ctx = renderer.getContext()
    renderer.dispose()
    return ctx != null
  } catch {
    return false
  }
}

// ─── Keypoints (wheelchair basketball, seated) ────────────────────────────────
const KP: [number, number, number][] = [
  [ 0.00,  1.90,  0.00],  // 0 nose
  [-0.15,  1.65,  0.00],  // 1 left  shoulder
  [ 0.15,  1.65,  0.00],  // 2 right shoulder
  [-0.38,  1.15,  0.05],  // 3 left  elbow
  [ 0.38,  1.15,  0.05],  // 4 right elbow
  [-0.32,  0.62,  0.00],  // 5 left  wrist
  [ 0.42,  0.65,  0.00],  // 6 right wrist
  [-0.18,  0.52,  0.00],  // 7 left  hip
  [ 0.18,  0.52,  0.00],  // 8 right hip
]

// Wheelchair frame
const WF: [number, number, number][] = [
  [-0.42,  0.30, -0.05],  // 0 seat left
  [ 0.42,  0.30, -0.05],  // 1 seat right
  [-0.42, -0.25, -0.05],  // 2 wheel-L
  [ 0.42, -0.25, -0.05],  // 3 wheel-R
]

// Bone connections (pairs of KP indices)
const BODY_CONN = [
  [0,1],[0,2],[1,2],     // head + shoulder bar
  [1,3],[3,5],           // left  arm
  [2,4],[4,6],           // right arm
  [1,7],[2,8],[7,8],     // torso + hip bar
]

// Frame connections (pairs of WF indices)
const FRAME_CONN = [
  [0,1],  // seat rail
  [0,2],  // left drop
  [1,3],  // right drop
]

// ─── Ambient particle data (created once, mutated each frame) ─────────────────
const PTCL = Array.from({ length: 60 }, () => ({
  x:     (Math.random() - 0.5) * 2.4,
  y:     Math.random() * 2.8 - 0.4,
  z:     (Math.random() - 0.5) * 1.6,
  speed: 0.3 + Math.random() * 0.7,
  phase: Math.random() * Math.PI * 2,
  amp:   0.05 + Math.random() * 0.14,
}))

// ─── Single pulsing joint ─────────────────────────────────────────────────────
function Joint({ p, idx, r = 0.052 }: { p: [number,number,number]; idx: number; r?: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.scale.setScalar(1 + 0.28 * Math.sin(clock.getElapsedTime() * 1.7 + idx * 0.65))
  })
  return (
    <mesh ref={ref} position={p}>
      <sphereGeometry args={[r, 12, 12]} />
      <meshStandardMaterial color="#FF5A1F" emissive="#FF5A1F" emissiveIntensity={1.1} roughness={0.25} />
    </mesh>
  )
}

// ─── All bone lines as a single LineSegments object ───────────────────────────
function Bones() {
  const segs = useMemo(() => {
    const verts: number[] = []
    BODY_CONN.forEach(([a, b]) => {
      const pa = KP[a]
      const pb = KP[b]
      if (pa && pb) verts.push(pa[0],pa[1],pa[2], pb[0],pb[1],pb[2])
    })
    FRAME_CONN.forEach(([a, b]) => {
      const pa = WF[a]
      const pb = WF[b]
      if (pa && pb) verts.push(pa[0],pa[1],pa[2], pb[0],pb[1],pb[2])
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3))
    const mat = new THREE.LineBasicMaterial({ color: 0xFF5A1F, opacity: 0.4, transparent: true })
    return new THREE.LineSegments(geo, mat)
  }, [])
  return <primitive object={segs} />
}

// ─── Wheelchair wheel ─────────────────────────────────────────────────────────
function Wheel({ p }: { p: [number,number,number] }) {
  return (
    <mesh position={p} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.32, 0.028, 8, 32]} />
      <meshStandardMaterial color="#FF5A1F" emissive="#FF5A1F" emissiveIntensity={0.6} roughness={0.4} />
    </mesh>
  )
}

// ─── Basketball ───────────────────────────────────────────────────────────────
function Ball() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.9 })
  return (
    <mesh ref={ref} position={[0.56, 0.64, 0.08]}>
      <sphereGeometry args={[0.13, 16, 16]} />
      <meshStandardMaterial color="#e05800" emissive="#c04000" emissiveIntensity={0.4} roughness={0.75} />
    </mesh>
  )
}

// ─── Floating particle cloud ──────────────────────────────────────────────────
function AmbientParticles() {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const arr = new Float32Array(PTCL.flatMap(p => [p.x, p.y, p.z]))
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const arr = ref.current.geometry.attributes.position.array as Float32Array
    const t = clock.getElapsedTime()
    PTCL.forEach((p, i) => { arr[i * 3 + 1] = p.y + Math.sin(t * p.speed + p.phase) * p.amp })
    ref.current.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#FF5A1F" size={0.022} sizeAttenuation transparent opacity={0.5} />
    </points>
  )
}

// ─── Scene root: mouse tilt + float ──────────────────────────────────────────
function Scene({ mouse }: { mouse: { x: number; y: number } }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y,  mouse.x *  0.16, 0.06)
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -mouse.y * 0.08, 0.06)
    ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.48) * 0.07
  })
  return (
    <group ref={ref}>
      <AmbientParticles />
      <Bones />
      {KP.map((p, i) => <Joint key={i} p={p} idx={i} />)}
      {WF.map((p, i) => <Joint key={`w${i}`} p={p} idx={KP.length + i} r={0.035} />)}
      {/* Helmet */}
      <mesh position={[0, 2.06, 0]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
      </mesh>
      {/* Wheels */}
      <Wheel p={WF[2]} />
      <Wheel p={WF[3]} />
      {/* Ball */}
      <Ball />
    </group>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SkeletonParticles() {
  // Probe BEFORE mounting Canvas — if Three.js WebGLRenderer can't init, skip it
  const [webgl] = useState<boolean>(() => probeWebGL())
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  if (!webgl) return <SkeletonHero />

  return (
    <Canvas
      camera={{ position: [0, 1.1, 4.8], fov: 46 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      onPointerMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setMouse({
          x: ((e.clientX - r.left) / r.width  - 0.5) * 2,
          y: ((e.clientY - r.top)  / r.height - 0.5) * 2,
        })
      }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[ 2.5, 3.5, 2]} color="#FF5A1F" intensity={4} />
      <pointLight position={[-2,   1.5, 1]} color="#0085C7" intensity={1.5} />
      <pointLight position={[ 0,  -0.5, 2]} color="#009F6B" intensity={0.8} />
      <Scene mouse={mouse} />
    </Canvas>
  )
}
