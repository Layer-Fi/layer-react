import { useCallback } from 'react'
import { Bar, LabelList, type LabelProps, Rectangle, type RectangleProps } from 'recharts'

import { type ChartDataPoint } from '@components/ProfitAndLossChart/chartDataPoint'
import { type BarConfig, isOutermostBar } from '@components/ProfitAndLossChart/profitAndLossChartBarConfig'
import { ProfitAndLossChartSelectionIndicator } from '@components/ProfitAndLossChart/ProfitAndLossChartSelectionIndicator'

type ProfitAndLossChartBarProps = BarConfig & {
  barSize: number
  selectedIndex: number
}

interface BarShapeProps extends RectangleProps {
  payload?: ChartDataPoint
}

const BAR_RADIUS: [number, number, number, number] = [2, 2, 0, 0]

export const ProfitAndLossChartBar = ({
  dataKey,
  xAxisId,
  cellFill,
  className,
  barSize,
  selectedIndex,
  barAnimation,
}: ProfitAndLossChartBarProps) => {
  const showIndicator = (dataKey === 'revenueBar' || dataKey === 'revenueBarInverse') && !barAnimation

  const renderIndicator = useCallback(
    (props: LabelProps) => (
      <ProfitAndLossChartSelectionIndicator {...props} selected={props.index === selectedIndex} />
    ),
    [selectedIndex],
  )

  const BarCell = useCallback((props: unknown) => {
    const { payload, fill, ...restProps } = props as BarShapeProps
    const shouldRound = payload && isOutermostBar(payload, dataKey, xAxisId)

    return <Rectangle {...restProps} fill={fill} radius={shouldRound ? BAR_RADIUS : 0} />
  }, [dataKey, xAxisId])

  return (
    <Bar
      dataKey={dataKey}
      barSize={barSize}
      animationDuration={100}
      className={className}
      xAxisId={xAxisId}
      stackId={xAxisId}
      isAnimationActive={barAnimation}
      fill={cellFill}
      shape={BarCell}
    >
      {showIndicator && <LabelList content={renderIndicator} />}
    </Bar>
  )
}
