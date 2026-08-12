import { type Scope } from '@internal-types/features/profitAndLoss/profitAndLoss'
import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { DEFAULT_CHART_COLORS, UNCATEGORIZED_CHART_COLOR } from '@utils/shared/styles/chartColors'

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
