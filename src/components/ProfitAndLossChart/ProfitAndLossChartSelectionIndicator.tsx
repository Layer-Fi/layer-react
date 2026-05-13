import type { LabelProps } from 'recharts'

type ProfitAndLossChartSelectionIndicatorProps = Pick<LabelProps, 'viewBox'> & {
  selected?: boolean
}

import './profitAndLossChartSelectionIndicator.scss'

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
      className='Layer__ProfitAndLossChart__SelectionIndicator'
      rx={borderRadius}
      ry={borderRadius}
      x={x - margin}
      y={-margin + 36}
      width={boxWidth}
      height='calc(100% - 38px)'
    />
  )
}
