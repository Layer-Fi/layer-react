import { createContext, type ReactNode, useContext, useMemo } from 'react'

import { type Scope } from '@internal-types/features/profitAndLoss/profitAndLoss'
import {
  type ProfitAndLossChartConfig,
} from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { DEFAULT_CHART_COLORS, UNCATEGORIZED_CHART_COLOR } from '@utils/shared/styles/chartColors'

const EMPTY_CONFIG: ProfitAndLossChartConfig = {}

const ProfitAndLossChartConfigContext = createContext<ProfitAndLossChartConfig>(EMPTY_CONFIG)

type ProfitAndLossChartConfigProviderProps = {
  children: ReactNode
  chartConfig?: ProfitAndLossChartConfig
  /**
   * Legacy flat palette applied to both scopes. Normalized into `colors` here so the fallback
   * chain lives in exactly one place.
   */
  chartColorsList?: string[]
}

export const ProfitAndLossChartConfigProvider = ({
  children,
  chartConfig,
  chartColorsList,
}: ProfitAndLossChartConfigProviderProps) => {
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

export type ProfitAndLossChartPalette = {
  /** Never empty — falls back to the built-in palette. */
  palette: string[]
  /** Resolved color for uncategorized line items, for swatches and mini chart slices. */
  uncategorized: string
  /**
   * Set only when the consumer overrode it. `undefined` keeps the dot-pattern fill on donut
   * slices and the default uncategorized icon in the detailed table.
   */
  uncategorizedOverride: string | undefined
}

export const useProfitAndLossChartPalette = (scope: Scope): ProfitAndLossChartPalette => {
  const { colors } = useContext(ProfitAndLossChartConfigContext)
  const scoped = scope === 'revenue' ? colors?.revenue : colors?.expenses
  const uncategorized = colors?.uncategorized

  return useMemo(() => ({
    palette: scoped?.length ? scoped : DEFAULT_CHART_COLORS,
    uncategorized: uncategorized ?? UNCATEGORIZED_CHART_COLOR,
    uncategorizedOverride: uncategorized,
  }), [scoped, uncategorized])
}

const EMPTY_TREND_CHART_CONFIG: NonNullable<ProfitAndLossChartConfig['trendChart']> = {}

export const useProfitAndLossTrendChartConfig = () =>
  useContext(ProfitAndLossChartConfigContext).trendChart ?? EMPTY_TREND_CHART_CONFIG

const EMPTY_DONUT_CHART_CONFIG: NonNullable<ProfitAndLossChartConfig['donutChart']> = {}

export const useProfitAndLossDonutChartConfig = () =>
  useContext(ProfitAndLossChartConfigContext).donutChart ?? EMPTY_DONUT_CHART_CONFIG
