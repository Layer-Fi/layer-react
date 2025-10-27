import { PropsWithChildren } from 'react'
import { useProfitAndLoss } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import { useProfitAndLossComparison } from '../../hooks/useProfitAndLossComparison'
import { ReportingBasis } from '../../types/general'
import { Container } from '../Container'
import { ProfitAndLossChart } from '../ProfitAndLossChart'
import { ProfitAndLossDetailedCharts } from '../ProfitAndLossDetailedCharts'
import { ProfitAndLossHeader } from '../ProfitAndLossHeader/ProfitAndLossHeader'
import { ProfitAndLossReport } from '../ProfitAndLossReport/ProfitAndLossReport'
import { ProfitAndLossSummaries } from '../ProfitAndLossSummaries/ProfitAndLossSummaries'
import { ProfitAndLossCompareConfig } from '../../types/profit_and_loss'
import { ReportsModeStoreProvider } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'
import { ProfitAndLossContext } from '../../contexts/ProfitAndLossContext/ProfitAndLossContext'
import { ProfitAndLossComparisonContext } from '../../contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'

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
