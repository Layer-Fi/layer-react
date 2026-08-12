import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'

/** Exercises every section of the config, across every P&L chart in a view. */
export const CUSTOM_CHART_CONFIG: ProfitAndLossChartConfig = {
  colors: {
    revenue: ['#0B7285', '#1098AD', '#22B8CF'],
    expenses: ['#A61E4D', '#C2255C', '#E64980'],
    uncategorized: '#FFD43B',
  },
  trendChart: { barSize: 36 },
  donutChart: { innerRadius: '70%' },
}
