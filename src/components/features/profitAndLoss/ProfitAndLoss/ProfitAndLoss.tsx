import { type PropsWithChildren } from 'react'

import { type ReportingBasis } from '@internal-types/shared/reportingBasis'
import { useProfitAndLoss } from '@hooks/features/profitAndLoss/useProfitAndLoss'
import { ProfitAndLossContext } from '@providers/profitAndLoss/ProfitAndLossContext/ProfitAndLossContext'
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
}>

const ProfitAndLoss = ({
  children,
  tagFilter,
  reportingBasis,
  asContainer = true,
}: Props) => {
  const contextData = useProfitAndLoss({ tagFilter, reportingBasis })

  return (
    <ProfitAndLossContext.Provider value={contextData}>
      {asContainer
        ? (
          <Container name='profit-and-loss'>{children}</Container>
        )
        : (
          children
        )}
    </ProfitAndLossContext.Provider>
  )
}

ProfitAndLoss.Chart = ProfitAndLossChart
ProfitAndLoss.Summaries = ProfitAndLossSummaries
ProfitAndLoss.DetailedCharts = ProfitAndLossDetailedCharts

ProfitAndLoss.Report = ProfitAndLossReport

export { ProfitAndLoss }
