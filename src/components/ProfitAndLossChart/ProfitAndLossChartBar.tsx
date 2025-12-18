import { useCallback } from 'react'
import { Bar, Cell, LabelList, type LabelProps } from 'recharts'

import {
  STRIPE_PATTERN_DARK_FILL,
  STRIPE_PATTERN_FILL,
} from '@components/ProfitAndLossChart/ProfitAndLossChartPatternDefs'
import { ProfitAndLossChartSelectionIndicator } from '@components/ProfitAndLossChart/ProfitAndLossChartSelectionIndicator'

export interface BarConfig {
  dataKey: string
  xAxisId: 'revenue' | 'expenses'
  radius?: [number, number, number, number]
  cellFill?: string
  className: string
  barAnimation?: boolean
}

export const PROFIT_AND_LOSS_BAR_CONFIG: BarConfig[] = [
  {
    dataKey: 'loadingBar',
    xAxisId: 'revenue',
    radius: [2, 2, 0, 0],
    className: 'Layer__profit-and-loss-chart__bar--loading',
  },
  {
    dataKey: 'loadingBarInverse',
    xAxisId: 'expenses',
    radius: [2, 2, 0, 0],
    className: 'Layer__profit-and-loss-chart__bar--loading',
  },
  {
    dataKey: 'expensesBarInverse',
    xAxisId: 'revenue',
    radius: [2, 2, 0, 0],
    cellFill: STRIPE_PATTERN_DARK_FILL,
    className: 'Layer__profit-and-loss-chart__bar--expenses',
  },
  {
    dataKey: 'revenue',
    xAxisId: 'revenue',
    className: 'Layer__profit-and-loss-chart__bar--income',
  },
  {
    dataKey: 'expensesUncategorizedBarInverse',
    xAxisId: 'revenue',
    radius: [2, 2, 0, 0],
    cellFill: STRIPE_PATTERN_DARK_FILL,
    className: 'Layer__profit-and-loss-chart__bar--expenses-uncategorized',

  },
  {
    dataKey: 'revenueUncategorized',
    xAxisId: 'revenue',
    radius: [2, 2, 0, 0],
    cellFill: STRIPE_PATTERN_FILL,
    className: 'Layer__profit-and-loss-chart__bar--income-uncategorized',

  },
  {
    dataKey: 'expensesBar',
    xAxisId: 'expenses',
    className: 'Layer__profit-and-loss-chart__bar--expenses',

  },
  {
    dataKey: 'expensesUncategorizedBar',
    xAxisId: 'expenses',
    radius: [2, 2, 0, 0],
    cellFill: STRIPE_PATTERN_DARK_FILL,
    className: 'Layer__profit-and-loss-chart__bar--expenses-uncategorized',

  },
]

type ProfitAndLossChartBarProps = BarConfig & {
  data: Array<{ name: string }>
  barSize: number
  selectedIndex: number
}

export const ProfitAndLossChartBar = ({
  data,
  dataKey,
  xAxisId,
  radius,
  cellFill,
  className,
  barSize,
  selectedIndex,
  barAnimation,
}: ProfitAndLossChartBarProps) => {
  const showIndicator = dataKey === 'revenue' && !barAnimation

  const renderIndicator = useCallback(
    (props: LabelProps) => (
      <ProfitAndLossChartSelectionIndicator {...props} selected={props.index === selectedIndex} />
    ),
    [selectedIndex],
  )

  return (
    <Bar
      dataKey={dataKey}
      barSize={barSize}
      animationDuration={100}
      radius={radius}
      className={className}
      xAxisId={xAxisId}
      stackId={xAxisId}
      isAnimationActive={barAnimation}
    >
      {showIndicator && <LabelList content={renderIndicator} />}
      {data.map(entry => <Cell key={entry.name} fill={cellFill} />)}
    </Bar>
  )
}
