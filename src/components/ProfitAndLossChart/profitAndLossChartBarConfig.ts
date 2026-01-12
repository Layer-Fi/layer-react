import { type ChartDataPoint } from '@components/ProfitAndLossChart/chartDataPoint'
import {
  STRIPE_PATTERN_DARK_FILL,
  STRIPE_PATTERN_FILL,
} from '@components/ProfitAndLossChart/ProfitAndLossChartPatternDefs'

export interface BarConfig {
  dataKey: keyof ChartDataPoint
  xAxisId: 'revenue' | 'expenses'
  cellFill?: string
  className: string
  barAnimation?: boolean
}

export const PROFIT_AND_LOSS_BAR_CONFIG: BarConfig[] = [
  // Revenue xAxisId - stacks upward (positive values)
  {
    dataKey: 'loadingBar',
    xAxisId: 'revenue',
    className: 'Layer__profit-and-loss-chart__bar--loading',
  },
  {
    dataKey: 'expensesUncategorizedBarInverse',
    xAxisId: 'revenue',
    cellFill: STRIPE_PATTERN_DARK_FILL,
    className: 'Layer__profit-and-loss-chart__bar--expenses-uncategorized',
  },
  {
    dataKey: 'expensesBarInverse',
    xAxisId: 'revenue',
    cellFill: STRIPE_PATTERN_DARK_FILL,
    className: 'Layer__profit-and-loss-chart__bar--expenses',
  },
  {
    dataKey: 'revenueBar',
    xAxisId: 'revenue',
    className: 'Layer__profit-and-loss-chart__bar--income',
  },
  {
    dataKey: 'revenueUncategorizedBar',
    xAxisId: 'revenue',
    cellFill: STRIPE_PATTERN_FILL,
    className: 'Layer__profit-and-loss-chart__bar--income-uncategorized',
  },
  // Expenses xAxisId - stacks downward (negative values)
  {
    dataKey: 'loadingBarInverse',
    xAxisId: 'expenses',
    className: 'Layer__profit-and-loss-chart__bar--loading',
  },
  {
    dataKey: 'revenueUncategorizedBarInverse',
    xAxisId: 'expenses',
    cellFill: STRIPE_PATTERN_FILL,
    className: 'Layer__profit-and-loss-chart__bar--income-uncategorized',
  },
  {
    dataKey: 'revenueBarInverse',
    xAxisId: 'expenses',
    className: 'Layer__profit-and-loss-chart__bar--income',
  },
  {
    dataKey: 'expensesBar',
    xAxisId: 'expenses',
    className: 'Layer__profit-and-loss-chart__bar--expenses',
  },
  {
    dataKey: 'expensesUncategorizedBar',
    xAxisId: 'expenses',
    cellFill: STRIPE_PATTERN_DARK_FILL,
    className: 'Layer__profit-and-loss-chart__bar--expenses-uncategorized',
  },
]

const computeBarStackOrder = (xAxisId: 'revenue' | 'expenses'): (keyof ChartDataPoint)[] =>
  PROFIT_AND_LOSS_BAR_CONFIG
    .filter(config => config.xAxisId === xAxisId)
    .map(config => config.dataKey)

const STACK_ORDER = {
  revenue: computeBarStackOrder('revenue'),
  expenses: computeBarStackOrder('expenses'),
} as const

const hasNonZeroValue = (dataPoint: ChartDataPoint, key: string): boolean => {
  const value = dataPoint[key as keyof ChartDataPoint]
  return typeof value === 'number' && value !== 0
}

export const isOutermostBar = (
  dataPoint: ChartDataPoint,
  dataKey: keyof ChartDataPoint,
  xAxisId: 'revenue' | 'expenses',
): boolean => {
  if (dataKey === 'loadingBar' || dataKey === 'loadingBarInverse') return true

  if (!hasNonZeroValue(dataPoint, dataKey)) return false

  const stackOrder = STACK_ORDER[xAxisId]
  const currentIndex = stackOrder.indexOf(dataKey)

  return !stackOrder.slice(currentIndex + 1).some(key => hasNonZeroValue(dataPoint, key))
}
