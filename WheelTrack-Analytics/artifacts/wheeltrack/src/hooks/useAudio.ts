import { useRef, useState } from 'react'

export function useAudio() {
  const ctx = useRef<AudioContext | null>(null)
  const [muted, setMuted] = useState(false)
  const lastPlayed = useRef(0)

  const play = (type: string) => {
    if (muted || Date.now() - lastPlayed.current < 500) return
    lastPlayed.current = Date.now()
    if (!ctx.current) ctx.current = new AudioContext()
    const osc = ctx.current.createOscillator()
    const gain = ctx.current.createGain()
    osc.connect(gain)
    gain.connect(ctx.current.destination)
    const now = ctx.current.currentTime
    if (type === 'efficient') {
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.linearRampToValueAtTime(660, now + 0.3)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    } else if (type === 'inefficient') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(200, now)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    } else if (type === 'danger') {
      osc.type = 'square'
      osc.frequency.setValueAtTime(880, now)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    } else if (type === 'complete') {
      osc.frequency.setValueAtTime(523, now)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    }
    osc.start()
    osc.stop(now + 0.6)
  }

  return { play, muted, toggleMute: () => setMuted(m => !m) }
}
