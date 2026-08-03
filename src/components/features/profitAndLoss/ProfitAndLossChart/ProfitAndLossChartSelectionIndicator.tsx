import { type LabelProps, useChartHeight, usePlotArea } from 'recharts'

type ProfitAndLossChartSelectionIndicatorProps = Pick<LabelProps, 'viewBox'> & {
  selected?: boolean
}

import './profitAndLossChartSelectionIndicator.scss'

const X_AXIS_LABEL_INSET = 14

export const ProfitAndLossChartSelectionIndicator = ({ viewBox, selected }: ProfitAndLossChartSelectionIndicatorProps) => {
  const plotArea = usePlotArea()
  const chartHeight = useChartHeight()

  if (!selected || plotArea === undefined || chartHeight === undefined) return null

  const boxHeight = chartHeight - X_AXIS_LABEL_INSET - plotArea.y
  if (boxHeight <= 0) return null

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
      y={plotArea.y}
      width={boxWidth}
      height={boxHeight}
    />
  )
}
