import { createContext, type ReactNode, useContext, useMemo } from 'react'

import { type Scope } from '@internal-types/features/profitAndLoss/profitAndLoss'
import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { DEFAULT_CHART_COLORS, UNCATEGORIZED_CHART_COLOR } from '@utils/shared/styles/chartColors'

const EMPTY: ProfitAndLossChartConfig = {}

const ProfitAndLossChartConfigContext = createContext<ProfitAndLossChartConfig>(EMPTY)

type ProviderProps = {
  children: ReactNode
  chartConfig?: ProfitAndLossChartConfig
  /** Legacy flat palette. Folded into both scopes here, so the fallback lives in one place. */
  chartColorsList?: string[]
}

/**
 * Merges over any enclosing provider, so a component may re-mount this to override one section
 * for its own subtree without discarding the rest of the view's config.
 */
export const ProfitAndLossChartConfigProvider = ({ children, chartConfig, chartColorsList }: ProviderProps) => {
  const parent = useContext(ProfitAndLossChartConfigContext)

  const value = useMemo(() => ({
    ...parent,
    ...chartConfig,
    colors: {
      revenue: chartConfig?.colors?.revenue ?? chartColorsList ?? parent.colors?.revenue,
      expenses: chartConfig?.colors?.expenses ?? chartColorsList ?? parent.colors?.expenses,
      uncategorized: chartConfig?.colors?.uncategorized ?? parent.colors?.uncategorized,
    },
  }), [parent, chartConfig, chartColorsList])

  return (
    <ProfitAndLossChartConfigContext.Provider value={value}>
      {children}
    </ProfitAndLossChartConfigContext.Provider>
  )
}

/**
 * `chartColorsListOverride` is the per-instance escape hatch behind the `chartColorsList` prop
 * still carried by `ProfitAndLoss.Summaries` and `ProfitAndLoss.DetailedCharts`; a prop set
 * directly on a chart beats the ambient config.
 *
 * `uncategorizedOverride` is set only when the consumer overrode it — `undefined` keeps the
 * dot-pattern donut fill and the default uncategorized table icon.
 */
export const useProfitAndLossChartPalette = (scope: Scope, chartColorsListOverride?: string[]) => {
  const { colors } = useContext(ProfitAndLossChartConfigContext)
  const scoped = chartColorsListOverride ?? (scope === 'revenue' ? colors?.revenue : colors?.expenses)
  const uncategorized = colors?.uncategorized

  return useMemo(() => ({
    palette: scoped?.length ? scoped : DEFAULT_CHART_COLORS,
    uncategorized: uncategorized ?? UNCATEGORIZED_CHART_COLOR,
    uncategorizedOverride: uncategorized,
  }), [scoped, uncategorized])
}

const EMPTY_TREND: NonNullable<ProfitAndLossChartConfig['trendChart']> = {}
const EMPTY_DONUT: NonNullable<ProfitAndLossChartConfig['donutChart']> = {}

export const useProfitAndLossTrendChartConfig = () =>
  useContext(ProfitAndLossChartConfigContext).trendChart ?? EMPTY_TREND

export const useProfitAndLossDonutChartConfig = () =>
  useContext(ProfitAndLossChartConfigContext).donutChart ?? EMPTY_DONUT
