import { type CSSProperties, useId } from 'react'

import './swatch.scss'

export type SwatchProps = {
  color: string
  opacity?: number
  pattern?: 'stripes'
}

export const Swatch = ({ color, opacity, pattern }: SwatchProps) => {
  const patternId = useId()
  const circleStyle: CSSProperties = {
    fill: pattern === 'stripes' ? `url(#${patternId})` : color,
    fillOpacity: opacity,
  }
  return (
    <svg
      aria-hidden
      className='Layer__Swatch'
      viewBox='0 0 10 10'
    >
      {pattern === 'stripes' && (
        <defs>
          <pattern
            id={patternId}
            width='4'
            height='4'
            patternUnits='userSpaceOnUse'
            patternTransform='rotate(45)'
          >
            <rect width='2' height='4' style={{ fill: color }} />
          </pattern>
        </defs>
      )}
      <circle cx='5' cy='5' r='5' style={circleStyle} />
    </svg>
  )
}
