import { type PropsWithChildren } from 'react'

import { type ReportingBasis } from '@internal-types/general'
import { useProfitAndLoss } from '@hooks/features/profitAndLoss/useProfitAndLoss'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { Container } from '@components/Container/Container'
import { ProfitAndLossChart } from '@components/ProfitAndLossChart/ProfitAndLossChart'
import { ProfitAndLossDetailedCharts } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossReport } from '@components/ProfitAndLossReport/ProfitAndLossReport'
import { ProfitAndLossSummaries } from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'

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
