import { useRef, useState, useEffect } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 60, damping: 15 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (inView) motionVal.set(target)
  }, [inView, target, motionVal])

  useEffect(() => {
    const unsub = spring.on('change', v => setDisplay(Math.round(v).toString()))
    return unsub
  }, [spring])

  return (
    <span ref={ref} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '4.5rem', color: '#FF5A1F', lineHeight: 1 }}>
      {display}{suffix}
    </span>
  )
}

const stats = [
  { value: 98, suffix: '%', label: 'Pose Detection Accuracy' },
  { value: 50, suffix: 'ms', label: 'Real-time Latency' },
  { value: 3, suffix: '', label: 'Joint Angles Tracked' },
]

export default function StatsCounter() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section ref={ref} style={{ padding: '6rem 1.5rem', background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
        {stats.map(({ value, suffix, label }, i) => (
          <motion.div
            key={label}
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.15, duration: 0.6 }}
          >
            <CountUp target={value} suffix={suffix} />
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#888880', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.5rem' }}>
              {label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
