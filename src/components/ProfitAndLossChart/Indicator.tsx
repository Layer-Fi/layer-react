import React, { useEffect, useState } from 'react'
import { Props as BaseProps } from 'recharts/types/component/Label'

// This component does not always exist. It gets recreated each time the
// selected month changes on the chart. As a result, the coordinates are not
// persistent and so resist CSS animation. That way we work around this is by
// telling the parent component what its X value is. The parent renders using
// that X as the "animateFrom" value. This then tells the paren its new X,
// which becomes the new "animateFrom", set using useState setter, which causes
// a render, which causes the new `animateFrom` to be passed in, which causes a
// change in the X coordinate, which causes a transition to trigger.

type Props = BaseProps & {
  animateFrom: number
  setAnimateFrom: (x: number) => void
  customCursorSize: { width: number; height: number }
  setCustomCursorSize: (width: number, height: number, x: number) => void
  barMargin?: number
}

const emptyViewBox = { x: 0, y: 0, width: 0, height: 0 }

export const Indicator = ({
  className,
  animateFrom,
  setAnimateFrom,
  customCursorSize,
  setCustomCursorSize,
  viewBox = {},
  barMargin = 6,
}: Props) => {
  const [opacityIndicator, setOpacityIndicator] = useState(0)

  const { x: animateTo = 0, width = 0 } =
    'x' in viewBox ? viewBox : emptyViewBox
  const margin = barMargin
  const boxWidth = width + margin
  const xOffset = boxWidth / 2
  const borderRadius = 6
  const rectWidth = `${boxWidth}px`
  const rectHeight = 'calc(100% - 8px)'

  // useEffect callbacks run after the browser paints
  useEffect(() => {
    if (Math.abs(animateTo - animateFrom) < 30) {
      setOpacityIndicator(0)
    }

    setAnimateFrom(animateTo)
    setTimeout(() => {
      setOpacityIndicator(1)
    }, 200)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateTo])

  if (!className?.match(/selected/)) {
    return null
  }

  const rectRef = (ref: SVGRectElement | null) => {
    if (ref) {
      const refRectWidth = ref.getBoundingClientRect().width
      const refRectHeight = ref.getBoundingClientRect().height
      if (
        customCursorSize.width !== refRectWidth
        || customCursorSize.height !== refRectHeight
      ) {
        setCustomCursorSize(refRectWidth, refRectHeight, animateTo - xOffset)
      }
    }
  }

  return (
    <rect
      ref={rectRef}
      className='Layer__profit-and-loss-chart__selection-indicator'
      rx={borderRadius}
      ry={borderRadius}
      style={{
        width: rectWidth,
        // @ts-expect-error -- y is fine but x apparently isn't!
        x: animateTo - margin / 2,
        y: 4,
        height: rectHeight,
        opacity: opacityIndicator,
      }}
    />
  )
}
