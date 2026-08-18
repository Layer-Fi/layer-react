import { type PropsWithChildren } from 'react'

import { type ReportingBasis } from '@internal-types/shared/reportingBasis'
import { ProfitAndLossContext } from '@providers/features/profitAndLoss/ProfitAndLossContext/ProfitAndLossContext'
import { useProfitAndLoss } from '@providers/features/profitAndLoss/ProfitAndLossContext/useProfitAndLoss'
import { withUsageTracking } from '@components/utility/withUsageTracking'
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

const ProfitAndLossComponent = ({
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

// The sub-components are wrapped here rather than in their own modules: internal code imports those
// modules directly, and these statics are the only public route to them.
const ProfitAndLoss = Object.assign(withUsageTracking('ProfitAndLoss', ProfitAndLossComponent), {
  Chart: withUsageTracking('ProfitAndLoss.Chart', ProfitAndLossChart),
  Summaries: withUsageTracking('ProfitAndLoss.Summaries', ProfitAndLossSummaries),
  DetailedCharts: withUsageTracking('ProfitAndLoss.DetailedCharts', ProfitAndLossDetailedCharts),
  Report: withUsageTracking('ProfitAndLoss.Report', ProfitAndLossReport),
})

export { ProfitAndLoss }
