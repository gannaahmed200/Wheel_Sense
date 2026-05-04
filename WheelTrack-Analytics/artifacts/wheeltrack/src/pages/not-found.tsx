import { InjuryAlertIcon } from '../components/icons'
import { BallIcon } from '../components/icons'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0a0a', flexDirection: 'column', gap: '1.5rem',
    }}>
      <BallIcon width={64} height={64} style={{ color: '#FF5A1F', opacity: 0.6 }} />
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '5rem', color: '#fff', letterSpacing: '0.15em', margin: 0 }}>
        OUT OF <span style={{ color: '#FF5A1F' }}>BOUNDS</span>
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#888880', fontSize: '1rem' }}>
        Page not found — this play didn't make the court.
      </p>
      <a href="/" style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
        fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.15em',
        color: '#FF5A1F', textDecoration: 'none', border: '1px solid rgba(255,90,31,0.4)',
        padding: '0.75rem 1.5rem', borderRadius: '9999px',
      }}>
        Back to Court
      </a>
    </div>
  )
}
