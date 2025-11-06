import { PropsWithChildren } from 'react'
import { useProfitAndLoss } from '@hooks/useProfitAndLoss/useProfitAndLoss'
import { useProfitAndLossComparison } from '@hooks/useProfitAndLossComparison/useProfitAndLossComparison'
import { ReportingBasis } from '@internal-types/general'
import { Container } from '@components/Container/Container'
import { ProfitAndLossChart } from '@components/ProfitAndLossChart/ProfitAndLossChart'
import { ProfitAndLossDetailedCharts } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossHeader } from '@components/ProfitAndLossHeader/ProfitAndLossHeader'
import { ProfitAndLossReport } from '@components/ProfitAndLossReport/ProfitAndLossReport'
import { ProfitAndLossSummaries } from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { ProfitAndLossCompareConfig } from '@internal-types/profit_and_loss'
import { ReportsModeStoreProvider } from '@providers/ReportsModeStoreProvider/ReportsModeStoreProvider'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'

type Props = PropsWithChildren & {
  tagFilter?: {
    key: string
    values: string[]
  }
  comparisonConfig?: ProfitAndLossCompareConfig
  reportingBasis?: ReportingBasis
  asContainer?: boolean
  withReportsModeProvider?: boolean
}

const ProfitAndLossWithoutReportsModeProvider = ({
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

const ProfitAndLossWithReportsModeProvider = (props: Props) => {
  return (
    <ReportsModeStoreProvider initialModes={{ ProfitAndLoss: 'monthPicker' }}>
      <ProfitAndLossWithoutReportsModeProvider {...props} />
    </ReportsModeStoreProvider>
  )
}

const ProfitAndLoss = ({ withReportsModeProvider = true, ...restProps }: Props) => {
  if (withReportsModeProvider) return <ProfitAndLossWithReportsModeProvider {...restProps} />
  return <ProfitAndLossWithoutReportsModeProvider {...restProps} />
}

ProfitAndLoss.Chart = ProfitAndLossChart
ProfitAndLoss.Summaries = ProfitAndLossSummaries
ProfitAndLoss.DetailedCharts = ProfitAndLossDetailedCharts

ProfitAndLoss.Header = ProfitAndLossHeader
ProfitAndLoss.Report = ProfitAndLossReport

export { ProfitAndLoss }
