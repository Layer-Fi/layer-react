import { type PropsWithChildren } from 'react'

import { type ReportingBasis } from '@internal-types/general'
import { type ProfitAndLossCompareConfig } from '@internal-types/profit_and_loss'
import { useProfitAndLoss } from '@hooks/useProfitAndLoss/useProfitAndLoss'
import { useProfitAndLossComparison } from '@hooks/useProfitAndLossComparison/useProfitAndLossComparison'
import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { Container } from '@components/Container/Container'
import { ProfitAndLossChart } from '@components/ProfitAndLossChart/ProfitAndLossChart'
import { ProfitAndLossDetailedCharts } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossHeader } from '@components/ProfitAndLossHeader/ProfitAndLossHeader'
import { ProfitAndLossReport } from '@components/ProfitAndLossReport/ProfitAndLossReport'
import { ProfitAndLossSummaries } from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'

type Props = PropsWithChildren<{
  tagFilter?: {
    key: string
    values: string[]
  }
  comparisonConfig?: ProfitAndLossCompareConfig
  reportingBasis?: ReportingBasis
  asContainer?: boolean
}>

const ProfitAndLoss = ({
  children,
  tagFilter,
  comparisonConfig,
  reportingBasis,
  asContainer = true,
}: Props) => {
  const contextData = useProfitAndLoss({ tagFilter, reportingBasis })
  const comparisonContextData = useProfitAndLossComparison({ comparisonConfig, reportingBasis })

  return (
    <ProfitAndLossContext.Provider value={contextData}>
      <ProfitAndLossComparisonContext.Provider value={comparisonContextData}>
        {asContainer
          ? (
            <Container name='profit-and-loss'>{children}</Container>
          )
          : (
            children
          )}
      </ProfitAndLossComparisonContext.Provider>
    </ProfitAndLossContext.Provider>
  )
}

ProfitAndLoss.Chart = ProfitAndLossChart
ProfitAndLoss.Summaries = ProfitAndLossSummaries
ProfitAndLoss.DetailedCharts = ProfitAndLossDetailedCharts

ProfitAndLoss.Header = ProfitAndLossHeader
ProfitAndLoss.Report = ProfitAndLossReport

export { ProfitAndLoss }
