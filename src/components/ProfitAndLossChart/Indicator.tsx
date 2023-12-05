import React from 'react'
import { ContentType } from 'recharts/types/component/Label'

const emptyViewBox = { x: 0, y: 0, width: 0, height: 0 }
export const Indicator: ContentType = ({ viewBox = {}, className }) => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
  } = 'x' in viewBox ? viewBox : emptyViewBox
  if (className?.match(/selected/)) {
    const boxWidth = width * 2 + 4 // the bar gap is 4
    const multiplier = 1.5
    const xOffset = (boxWidth * multiplier - boxWidth) / 2
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
