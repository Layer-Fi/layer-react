import React from 'react'

type IndicatorProps = {
  x: number
  y: number
  width: number
  height: number
  className: string
}

export const Indicator = ({
  x,
  y,
  width,
  height,
  className,
}: IndicatorProps) => {
  const boxWidth = width * 2 + 4 // the bar gap
  const multiplier = 1.5
  const xOffset = (boxWidth * multiplier - boxWidth) / 2
  if (className.match(/selected/)) {
    return (
      <rect
        className="Layer__profit-and-loss-chart__selection-indicator"
        width={boxWidth * multiplier}
        x={x - xOffset}
        y={y + height}
      />
    )
  } else {
    return null
  }
}
