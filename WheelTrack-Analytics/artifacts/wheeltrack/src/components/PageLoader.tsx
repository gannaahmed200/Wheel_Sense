import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-[9999]"
      style={{ background: '#000' }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '6rem', letterSpacing: '0.2em', lineHeight: 1 }}>
          <span style={{ color: '#fff' }}>WHEEL</span>
          <span style={{ color: '#FF5A1F' }}>TRACK</span>
        </h1>
        <motion.div
          style={{ height: 2, background: '#FF5A1F', marginTop: '1rem' }}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '0.75rem', marginTop: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Paralympic Performance Analysis
        </p>
      </motion.div>
      <motion.div
        style={{ position: 'absolute', bottom: '3rem', display: 'flex', gap: '0.25rem' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF5A1F' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
