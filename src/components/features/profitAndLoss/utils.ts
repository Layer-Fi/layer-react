import { type Scope } from '@internal-types/features/profitAndLoss/profitAndLoss'
import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { DEFAULT_CHART_COLORS, UNCATEGORIZED_CHART_COLOR } from '@utils/shared/styles/chartColors'

const DEFAULT_BAR_WIDTH = 20
const DEFAULT_COMPACT_BAR_WIDTH = 10

export const resolveProfitAndLossBarWidth = (
  { compactView, chartConfig }: { compactView: boolean, chartConfig?: ProfitAndLossChartConfig },
) => {
  const { barWidth, compactBarWidth } = chartConfig?.barChart ?? {}

  if (!compactView) {
    return barWidth ?? DEFAULT_BAR_WIDTH
  }

  // Halving a configured width keeps the responsive shrink an override would otherwise disable.
  return compactBarWidth
    ?? (barWidth === undefined ? DEFAULT_COMPACT_BAR_WIDTH : Math.round(barWidth / 2))
}

export const resolveProfitAndLossChartPalette = (
  scope: Scope,
  chartConfig?: ProfitAndLossChartConfig,
  chartColorsList?: string[],
) => {
  const scopedPalette = scope === 'revenue'
    ? chartConfig?.colors?.revenue
    : chartConfig?.colors?.expenses
  const palette = scopedPalette ?? chartColorsList
  const uncategorizedOverride = chartConfig?.colors?.uncategorized

  return {
    palette: palette?.length ? palette : DEFAULT_CHART_COLORS,
    uncategorized: uncategorizedOverride ?? UNCATEGORIZED_CHART_COLOR,
    uncategorizedOverride,
  }
}
