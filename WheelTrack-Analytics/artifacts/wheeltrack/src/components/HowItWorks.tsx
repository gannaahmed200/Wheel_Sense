import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { CourtCameraIcon, PoseAnalysisIcon, WhistleOnIcon } from './icons'

const steps = [
  { icon: CourtCameraIcon, title: 'Camera Captures', desc: 'Court camera streams live video of the athlete during play or training.' },
  { icon: PoseAnalysisIcon, title: 'AI Analyzes Pose', desc: 'MediaPipe BlazePose detects 33 joint keypoints. Kinematics engine computes elbow, shoulder, and trunk angles in real-time.' },
  { icon: WhistleOnIcon, title: 'Audio Alert Fires', desc: 'When a dangerous movement is detected, a sonified alert plays instantly — no screens needed, eyes stay on the game.' },
]

// ─── Skeleton keypoints (scaled for a 220×300 viewBox) ────────────────────────
const KP = [
  { x: 110, y: 20  },  //  0 nose
  { x:  82, y: 58  },  //  1 left  shoulder
  { x: 138, y: 58  },  //  2 right shoulder
  { x:  56, y: 106 },  //  3 left  elbow
  { x: 164, y: 106 },  //  4 right elbow
  { x:  62, y: 152 },  //  5 left  wrist
  { x: 172, y: 148 },  //  6 right wrist
  { x:  88, y: 152 },  //  7 left  hip
  { x: 132, y: 152 },  //  8 right hip
  // Wheelchair seat frame
  { x:  68, y: 172 },  //  9 seat-L
  { x: 152, y: 172 },  // 10 seat-R
  { x:  68, y: 220 },  // 11 wheel-L centre
  { x: 152, y: 220 },  // 12 wheel-R centre
]

const BONES = [
  [0,1],[0,2],[1,2],[1,3],[3,5],[2,4],[4,6],[1,7],[2,8],[7,8],
  [7,9],[8,10],[9,10],[9,11],[10,12],
]

interface HowItWorksProps {
  id?: string
}

export default function HowItWorks({ id }: HowItWorksProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  // Each joint appears 0.08s apart; bones start after last joint
  const jointDelay  = (i: number) => i * 0.08
  const boneDelay   = (i: number) => KP.length * 0.08 + i * 0.04

  return (
    <section id={id} ref={ref} style={{ padding: '7rem 1.5rem', background: '#0d0d0d' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

        {/* ── Heading ─────────────────────────────────────────────────── */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.75rem', letterSpacing: '0.15em', color: '#fff' }}>
            HOW IT <span style={{ color: '#FF5A1F' }}>WORKS</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', marginTop: '0.75rem', maxWidth: '28rem', margin: '0.75rem auto 0' }}>
            Three stages. Real-time. No wearables required.
          </p>
        </motion.div>

        {/* ── Skeleton joints — appear one by one on scroll ────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <svg
            width="220" height="300"
            viewBox="0 0 220 300"
            style={{ overflow: 'visible', filter: 'drop-shadow(0 0 20px rgba(255,90,31,0.15))' }}
          >
            {/* Bones — appear after joints */}
            {BONES.map(([a, b], i) => (
              <motion.line
                key={`bone-${i}`}
                x1={KP[a].x} y1={KP[a].y}
                x2={KP[b].x} y2={KP[b].y}
                stroke="rgba(255,90,31,0.38)"
                strokeWidth="1.8"
                strokeLinecap="round"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={inView ? { opacity: 1, pathLength: 1 } : {}}
                transition={{ duration: 0.35, delay: boneDelay(i), ease: 'easeOut' }}
              />
            ))}

            {/* Wheelchair wheels */}
            {[{ cx: 68, cy: 220, r: 42 }, { cx: 152, cy: 220, r: 42 }].map((w, i) => (
              <motion.circle
                key={`wheel-${i}`}
                cx={w.cx} cy={w.cy} r={w.r}
                fill="none"
                stroke="rgba(255,90,31,0.48)"
                strokeWidth="4"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,90,31,0.4))' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: BONES.length * 0.04 + KP.length * 0.08 + i * 0.1, ease: 'backOut' }}
              />
            ))}

            {/* Joints — each pops in sequentially */}
            {KP.map((kp, i) => (
              <motion.g key={`joint-${i}`}>
                {/* Outer glow ring */}
                <motion.circle
                  cx={kp.x} cy={kp.y} r={9}
                  fill="rgba(255,90,31,0.15)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.3, delay: jointDelay(i), ease: 'backOut' }}
                />
                {/* Core joint */}
                <motion.circle
                  cx={kp.x} cy={kp.y} r={4.5}
                  fill="#FF5A1F"
                  style={{ filter: 'drop-shadow(0 0 5px rgba(255,90,31,0.9))' }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={inView ? {
                    scale: [0, 1.35, 1],
                    opacity: 1,
                  } : {}}
                  transition={{ duration: 0.35, delay: jointDelay(i), ease: 'easeOut' }}
                />
                {/* Persistent pulse after appearing */}
                {inView && (
                  <motion.circle
                    cx={kp.x} cy={kp.y} r={4.5}
                    fill="transparent"
                    stroke="#FF5A1F"
                    strokeWidth="1"
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{
                      duration: 1.2,
                      delay: jointDelay(i) + 0.35,
                      ease: 'easeOut',
                      repeat: Infinity,
                      repeatDelay: 2 + i * 0.1,
                    }}
                  />
                )}
              </motion.g>
            ))}

            {/* Helmet */}
            <motion.circle
              cx={110} cy={20} r={18}
              fill="#1a1a1a"
              stroke="rgba(255,90,31,0.25)"
              strokeWidth="1"
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.35, delay: 0, ease: 'backOut' }}
            />

            {/* Label */}
            <motion.text
              x={110} y={292}
              textAnchor="middle"
              fill="rgba(255,90,31,0.45)"
              fontSize="8"
              fontFamily="'Barlow Condensed', sans-serif"
              letterSpacing="2"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: BONES.length * 0.04 + KP.length * 0.08 + 0.5 }}
            >
              MEDIAPIPE · 33 KEYPOINTS
            </motion.text>
          </svg>
        </div>

        {/* ── Step cards ───────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', position: 'relative' }}>
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              style={{
                background: '#1c1c1c',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '1rem',
                padding: '2rem',
                textAlign: 'center',
              }}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(255,90,31,0.12)' } as any}
            >
              <div style={{
                width: 64, height: 64,
                background: 'rgba(255,90,31,0.1)',
                border: '1px solid rgba(255,90,31,0.2)',
                borderRadius: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}>
                <Icon style={{ color: '#FF5A1F', width: 28, height: 28 }} />
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#FF5A1F', fontSize: '2.25rem', marginBottom: '0.25rem' }}>
                0{i + 1}
              </div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                {title}
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
