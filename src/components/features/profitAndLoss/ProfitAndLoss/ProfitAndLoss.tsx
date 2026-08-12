import { type PropsWithChildren } from 'react'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { type ReportingBasis } from '@internal-types/shared/reportingBasis'
import { ProfitAndLossChartConfigProvider } from '@providers/features/profitAndLoss/ProfitAndLossChartConfigContext/ProfitAndLossChartConfigContext'
import { ProfitAndLossContext } from '@providers/features/profitAndLoss/ProfitAndLossContext/ProfitAndLossContext'
import { useProfitAndLoss } from '@providers/features/profitAndLoss/ProfitAndLossContext/useProfitAndLoss'
import { Container } from '@blocks/Layout/Container/Container'
import { ProfitAndLossChart } from '@features/profitAndLoss/ProfitAndLossChart/ProfitAndLossChart'
import { ProfitAndLossDetailedCharts } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossReport } from '@features/profitAndLoss/ProfitAndLossReport/ProfitAndLossReport'
import { ProfitAndLossSummaries } from '@features/profitAndLoss/ProfitAndLossSummaries/ProfitAndLossSummaries'

type Props = PropsWithChildren<{
  tagFilter?: {
    key: string
    values: string[]
  }
  /**
   * @deprecated The Profit & Loss comparison feature has been removed and this prop is ignored.
   * Use the `UnifiedReports` component for period/tag comparisons instead.
   */
  comparisonConfig?: unknown
  reportingBasis?: ReportingBasis
  asContainer?: boolean
  /**
   * Chart styling for this subtree. `colors` reaches every P&L chart; the sizing sections are
   * per-chart, since the fixed-size summary mini donuts take pixel radii rather than the
   * detailed donut's percentages.
   */
  chartConfig?: ProfitAndLossChartConfig
  /**
   * Flat palette applied to both scopes. Fully supported; it is the fallback for whichever side
   * of `chartConfig.colors` is omitted.
   */
  chartColorsList?: string[]
}>

const ProfitAndLoss = ({
  children,
  tagFilter,
  reportingBasis,
  asContainer = true,
  chartConfig,
  chartColorsList,
}: Props) => {
  const contextData = useProfitAndLoss({ tagFilter, reportingBasis })

  return (
    <ProfitAndLossContext.Provider value={contextData}>
      <ProfitAndLossChartConfigProvider chartConfig={chartConfig} chartColorsList={chartColorsList}>
        {asContainer
          ? (
            <Container name='profit-and-loss'>{children}</Container>
          )
          : (
            children
          )}
      </ProfitAndLossChartConfigProvider>
    </ProfitAndLossContext.Provider>
  )
}

ProfitAndLoss.Chart = ProfitAndLossChart
ProfitAndLoss.Summaries = ProfitAndLossSummaries
ProfitAndLoss.DetailedCharts = ProfitAndLossDetailedCharts

ProfitAndLoss.Report = ProfitAndLossReport

export { ProfitAndLoss }
