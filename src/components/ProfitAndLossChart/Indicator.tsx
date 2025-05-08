import type { Props as LabelBaseProps } from 'recharts/types/component/Label'

type IndicatorProps = Pick<LabelBaseProps, 'className' | 'viewBox'> & {
  customCursorSize: { width: number, height: number }
  setCustomCursorSize: (width: number, height: number, x: number) => void
}

export const Indicator = ({
  className,
  customCursorSize,
  setCustomCursorSize,
  viewBox,
}: IndicatorProps) => {
  if (!className?.match(/selected/)) {
    return null
  }

  const { x = 0, width = 0 } = (viewBox && 'x' in viewBox)
    ? viewBox
    : { width: 0 }

  const margin = width > 12 ? 12 : 6
  const boxWidth = width + (2 * margin)
  const xOffset = boxWidth / 2
  const borderRadius = 6

  const rectRefCallback = (ref: SVGRectElement | null) => {
    if (ref) {
      const refRectWidth = ref.getBoundingClientRect().width
      const refRectHeight = ref.getBoundingClientRect().height
      if (
        customCursorSize.width !== refRectWidth
        || customCursorSize.height !== refRectHeight
      ) {
        setCustomCursorSize(refRectWidth, refRectHeight, x - xOffset)
      }
    }
  }

  return (
    <rect
      ref={rectRefCallback}
      className='Layer__profit-and-loss-chart__selection-indicator'
      rx={borderRadius}
      ry={borderRadius}
      x={x - margin}
      y={16}
      width={boxWidth}
      height='calc(100% - 30px)'
    />
  )
}
