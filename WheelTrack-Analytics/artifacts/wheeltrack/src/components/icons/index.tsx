// ─── Wheelchair Basketball & Paralympics Themed SVG Icons ──────────────────────
// Replacing generic lucide-react icons with sport-specific custom SVGs

interface IconProps {
  style?: React.CSSProperties
  width?: number
  height?: number
  className?: string
}

// ─── Basketball (replaces generic circle/alert) ────────────────────────────────
export function BallIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2 Q18 6 18 12 Q18 18 12 22" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M12 2 Q6 6 6 12 Q6 18 12 22" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M2 12 Q6 9 12 12 Q18 15 22 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

// ─── Ball Bounce / Chevron Down ────────────────────────────────────────────────
export function BallBounceIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Ball */}
      <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 5.5 Q12 7 14.5 5.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M9 9 Q12 11 15 9" stroke="currentColor" strokeWidth="1.2" fill="none" />
      {/* Bounce arrow */}
      <path d="M8 17 L12 21 L16 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Shadow ellipse */}
      <ellipse cx="12" cy="22.5" rx="4" ry="1" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

// ─── Wheelchair Athlete (replaces Camera / generic person) ────────────────────
export function WheelchairAthleteIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Head */}
      <circle cx="13" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.8" />
      {/* Body */}
      <path d="M13 5.5 L13 9 L10 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Arm reaching (passing ball) */}
      <path d="M13 7 L17 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Wheel */}
      <circle cx="10" cy="16" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10" cy="16" r="1.2" fill="currentColor" />
      {/* Spokes */}
      <line x1="10" y1="11.5" x2="10" y2="14" stroke="currentColor" strokeWidth="1.2" />
      <line x1="10" y1="18" x2="10" y2="20.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="5.5" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12" y1="16" x2="14.5" y2="16" stroke="currentColor" strokeWidth="1.2" />
      {/* Seat */}
      <path d="M13 9 L15 12 L10 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Front caster */}
      <circle cx="15.5" cy="19.5" r="1.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

// ─── Court Camera (replaces Camera icon) ──────────────────────────────────────
export function CourtCameraIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Camera body */}
      <rect x="2" y="7" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      {/* Lens */}
      <circle cx="12" cy="13.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="13.5" r="1.5" fill="currentColor" opacity="0.5" />
      {/* Shutter */}
      <path d="M8 7 L10 4 L14 4 L16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Court lines overlay on lens */}
      <path d="M9.5 13.5 L14.5 13.5" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
      {/* Flash dot */}
      <circle cx="18" cy="10" r="1" fill="currentColor" />
    </svg>
  )
}

// ─── Film / Video Analysis (replaces Film icon) ───────────────────────────────
export function PlayAnalysisIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      {/* Sprocket holes */}
      <rect x="4" y="6" width="2.5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="4" y="11" width="2.5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="17.5" y="6" width="2.5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="17.5" y="11" width="2.5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      {/* Play triangle */}
      <path d="M10 9 L16 12 L10 15 Z" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

// ─── Upload / Model Upload ────────────────────────────────────────────────────
export function UploadBallIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Arrow up */}
      <path d="M12 3 L12 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 7.5 L12 3 L16.5 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Basketball below */}
      <circle cx="12" cy="19" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 17.5 Q12 19 15.5 17.5" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <path d="M8.5 20.5 Q12 19 15.5 20.5" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </svg>
  )
}

// ─── Check / Medal (replaces CheckCircle) ────────────────────────────────────
export function MedalCheckIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Medal ribbon */}
      <path d="M10 2 L12 6 L14 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Medal circle */}
      <circle cx="12" cy="14" r="7" stroke="currentColor" strokeWidth="1.8" />
      {/* Check */}
      <path d="M9 14 L11 16 L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Star points on medal */}
      <circle cx="12" cy="14" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

// ─── Download / Trophy Export ─────────────────────────────────────────────────
export function TrophyDownloadIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Trophy cup */}
      <path d="M8 3 L16 3 L15 10 Q14 13 12 13 Q10 13 9 10 Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      {/* Handles */}
      <path d="M8 5 Q4 5 4 8 Q4 11 8 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M16 5 Q20 5 20 8 Q20 11 16 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Base stem */}
      <path d="M12 13 L12 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 17 L15 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      {/* Download arrow */}
      <path d="M12 19 L12 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M10 21.5 L12 23 L14 21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  )
}

// ─── Whistle Sound On (replaces Volume2) ─────────────────────────────────────
export function WhistleOnIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Whistle body */}
      <path d="M3 10 Q3 7 6 7 L14 7 Q16 7 16 9 L16 10 Q16 14 12 15 Q8 15 6 13 Q3 13 3 10 Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      {/* Ball inside */}
      <circle cx="9" cy="11" r="1.2" fill="currentColor" opacity="0.6" />
      {/* Mouthpiece */}
      <path d="M14 8 L20 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Sound waves */}
      <path d="M18 13 Q19.5 11.5 19.5 10 Q19.5 8.5 18 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M20 15 Q22 12.5 22 10 Q22 7.5 20 5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

// ─── Whistle Muted (replaces VolumeX) ────────────────────────────────────────
export function WhistleOffIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Whistle body */}
      <path d="M3 10 Q3 7 6 7 L14 7 Q16 7 16 9 L16 10 Q16 14 12 15 Q8 15 6 13 Q3 13 3 10 Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="11" r="1.2" fill="currentColor" opacity="0.6" />
      <path d="M14 8 L20 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Mute X */}
      <path d="M18 8 L22 12 M22 8 L18 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// ─── AI Brain / Pose Analysis (replaces Brain) ────────────────────────────────
export function PoseAnalysisIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Stick figure in wheelchair */}
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 6 L12 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 8 L15 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* Scan lines (AI overlay) */}
      <path d="M5 12 L19 12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      <path d="M5 15 L19 15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.35" />
      {/* Keypoint dots */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="9" cy="10" r="1" fill="currentColor" opacity="0.7" />
      <circle cx="15" cy="10" r="1" fill="currentColor" opacity="0.7" />
      {/* Wheel */}
      <circle cx="12" cy="19" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="19" r="1" fill="currentColor" opacity="0.5" />
      <path d="M12 15.5 L12 17 M12 21 L12 22.5 M8.5 19 L10 19 M14 19 L15.5 19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Alert / Injury Risk (replaces AlertCircle) ───────────────────────────────
export function InjuryAlertIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      {/* Triangle warning */}
      <path d="M12 3 L22 20 L2 20 Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Body joint highlight — angle symbol */}
      <path d="M10 10 L12 15 L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dot */}
      <circle cx="12" cy="17.5" r="1" fill="currentColor" />
    </svg>
  )
}

// ─── Paralympic Agito / History Star ─────────────────────────────────────────
export function ParalympicIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M5 12 A8 8 0 0 1 16 5" stroke="#EF3340" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 16 A8 8 0 0 1 19 9" stroke="#0085C7" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M11 20 A8 8 0 0 1 22 13" stroke="#009F6B" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Court Lines / History (replaces generic graph) ──────────────────────────
export function CourtHistoryIcon({ style, width = 24, height = 24 }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" style={style}>
      <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
      {/* Court center line */}
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      {/* Circle */}
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      {/* Performance line chart */}
      <path d="M4 17 L7 13 L10 15 L14 9 L17 11 L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="9" r="1.5" fill="currentColor" />
    </svg>
  )
}
