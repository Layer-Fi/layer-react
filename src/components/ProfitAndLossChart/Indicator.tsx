import React, { useEffect } from 'react'
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
}
const emptyViewBox = { x: 0, y: 0, width: 0, height: 0 }
export const Indicator = ({
  viewBox = {},
  className,
  animateFrom,
  setAnimateFrom,
}: Props) => {
  if (!className?.match(/selected/)) {
    return null
  }

  const { x: animateTo = 0, width = 0 } =
    'x' in viewBox ? viewBox : emptyViewBox
  const margin = width > 12 ? 4 : 1
  const boxWidth = width * 2 + margin
  const multiplier = width > 12 ? 1.2 : 1
  const xOffset = (boxWidth * multiplier - boxWidth) / 2
  const borderRadius = width > 16 ? 8 : width / 2

  // useEffect callbacks run after the browser paints
  useEffect(() => {
    setAnimateFrom(animateTo)
  }, [animateTo])

  const actualX = animateFrom === -1 ? animateTo : animateFrom
  return (
    <rect
      className='Layer__profit-and-loss-chart__selection-indicator'
      rx={borderRadius}
      ry={borderRadius}
      style={{
        width: `${boxWidth * multiplier}px`,
        // @ts-expect-error -- y is fine but x apparently isn't!
        x: actualX - xOffset,
        y: 22,
        height: 'calc(100% - 38px)',
      }}
    />
  )
}
