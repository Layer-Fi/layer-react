import { useEffect, useState } from 'react'
import { Props as BaseProps } from 'recharts/types/component/Label'

/*
 * This component does not always exist. It gets recreated each time the
 * selected month changes on the chart.
 *
 * The component intentionally breaks the rules of hooks.
 *
 * The coordinates are not persistent, so they resist CSS animation; we need a "double-render"
 * of the component for animation.
 */

type Props = BaseProps & {
  animateFrom: number
  setAnimateFrom: (x: number) => void
  customCursorSize: { width: number, height: number }
  setCustomCursorSize: (width: number, height: number, x: number) => void
}
const emptyViewBox = { x: 0, y: 0, width: 0, height: 0 }
export const Indicator = ({
  className,
  animateFrom,
  setAnimateFrom,
  customCursorSize,
  setCustomCursorSize,
  viewBox = {},
}: Props) => {
  if (!className?.match(/selected/)) {
    return null
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [opacityIndicator, setOpacityIndicator] = useState(0)

  const { x: animateTo = 0, width = 0 } =
    'x' in viewBox ? viewBox : emptyViewBox
  const margin = width > 12 ? 12 : 6
  const boxWidth = width + (2 * margin)
  const xOffset = boxWidth / 2
  const borderRadius = 6

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (Math.abs(animateTo - animateFrom) < 30) {
      setOpacityIndicator(0)
    }

    setAnimateFrom(animateTo)
    setTimeout(() => {
      setOpacityIndicator(1)
    }, 200)
  }, [animateTo])

  const rectRef = (ref: SVGRectElement | null) => {
    if (ref) {
      const refRectWidth = ref.getBoundingClientRect().width
      const refRectHeight = ref.getBoundingClientRect().height
      if (
        customCursorSize.width !== refRectWidth
        || customCursorSize.height !== refRectHeight
      ) {
        setCustomCursorSize(refRectWidth, refRectHeight, actualX - xOffset)
      }
    }
  }

  const actualX = animateFrom === -1 ? animateTo : animateFrom
  return (
    <rect
      ref={rectRef}
      className='Layer__profit-and-loss-chart__selection-indicator'
      rx={borderRadius}
      ry={borderRadius}
      style={{
        width: `${boxWidth}px`,
        // @ts-expect-error -- "y" is fine but "x" apparently isn't!
        x: actualX - margin,
        y: 16,
        height: 'calc(100% - 30px)',
        opacity: opacityIndicator,
      }}
    />
  )
}
