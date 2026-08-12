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

export const ProfitAndLossChartConfigProvider = ({ children, chartConfig, chartColorsList }: ProviderProps) => {
  const value = useMemo(() => ({
    ...chartConfig,
    colors: {
      revenue: chartConfig?.colors?.revenue ?? chartColorsList,
      expenses: chartConfig?.colors?.expenses ?? chartColorsList,
      uncategorized: chartConfig?.colors?.uncategorized,
    },
  }), [chartConfig, chartColorsList])

  return (
    <ProfitAndLossChartConfigContext.Provider value={value}>
      {children}
    </ProfitAndLossChartConfigContext.Provider>
  )
}

/**
 * `uncategorizedOverride` is set only when the consumer overrode it — `undefined` keeps the
 * dot-pattern donut fill and the default uncategorized table icon.
 */
export const useProfitAndLossChartPalette = (scope: Scope) => {
  const { colors } = useContext(ProfitAndLossChartConfigContext)
  const scoped = scope === 'revenue' ? colors?.revenue : colors?.expenses
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
