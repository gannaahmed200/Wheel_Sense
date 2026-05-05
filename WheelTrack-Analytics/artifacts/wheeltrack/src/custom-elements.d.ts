import type {
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
} from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
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
          style?: CSSProperties
          ar?: boolean | string
        },
        HTMLElement
      >
    }
  }
}
