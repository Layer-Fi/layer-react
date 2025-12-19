import type { LabelProps } from 'recharts'

type ProfitAndLossChartSelectionIndicatorProps = Pick<LabelProps, 'viewBox'> & {
  selected?: boolean
}

export const ProfitAndLossChartSelectionIndicator = ({ viewBox, selected }: ProfitAndLossChartSelectionIndicatorProps) => {
  if (!selected) return null

  const { x = 0, width = 0 } = viewBox !== undefined && 'x' in viewBox
    ? viewBox
    : { x: 0, width: 0 }

  const margin = width > 12 ? 12 : 6
  const boxWidth = width + (2 * margin)
  const borderRadius = 6

  return (
    <rect
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
