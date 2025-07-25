import { PropsWithChildren, createContext } from 'react'
import { PNLComparisonContext } from '../../contexts/ProfitAndLossComparisonContext'
import { useProfitAndLoss } from '../../hooks/useProfitAndLoss/useProfitAndLoss'
import { useProfitAndLossComparison } from '../../hooks/useProfitAndLossComparison'
import { ReportingBasis } from '../../types'
import { Container } from '../Container'
import { ProfitAndLossChart } from '../ProfitAndLossChart'
import { ProfitAndLossCompareOptions } from '../ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { ProfitAndLossDetailedCharts } from '../ProfitAndLossDetailedCharts'
import { ProfitAndLossDownloadButton } from '../ProfitAndLossDownloadButton'
import { ProfitAndLossHeader } from '../ProfitAndLossHeader'
import { ProfitAndLossReport } from '../ProfitAndLossReport/ProfitAndLossReport'
import { ProfitAndLossSummaries } from '../ProfitAndLossSummaries/ProfitAndLossSummaries'
import { ProfitAndLossTable } from '../ProfitAndLossTable'
import { endOfMonth, startOfMonth } from 'date-fns'
import { ProfitAndLossCompareConfig } from '../../types/profit_and_loss'
import { ReportsModeStoreProvider } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'

type PNLContextType = ReturnType<typeof useProfitAndLoss>
const PNLContext = createContext<PNLContextType>({
  data: undefined,
  filteredDataRevenue: [],
  filteredTotalRevenue: undefined,
  filteredDataExpenses: [],
  filteredTotalExpenses: undefined,
  isLoading: true,
  isValidating: false,
  error: undefined,
  dateRange: {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
  refetch: () => {},
  sidebarScope: undefined,
  setSidebarScope: () => {},
  sortBy: () => {},
  setFilterTypes: () => {},
  filters: {
    expenses: undefined,
    revenue: undefined,
  },
  tagFilter: undefined,
})

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
    <PNLContext.Provider value={contextData}>
      <PNLComparisonContext.Provider value={comparisonContextData}>
        {asContainer
          ? (
            <Container name='profit-and-loss'>{children}</Container>
          )
          : (
            children
          )}
      </PNLComparisonContext.Provider>
    </PNLContext.Provider>
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
ProfitAndLoss.Context = PNLContext
ProfitAndLoss.ComparisonContext = PNLComparisonContext
ProfitAndLoss.DatePicker = ProfitAndLossDatePicker
ProfitAndLoss.CompareOptions = ProfitAndLossCompareOptions
ProfitAndLoss.Summaries = ProfitAndLossSummaries
ProfitAndLoss.Table = ProfitAndLossTable
ProfitAndLoss.DetailedCharts = ProfitAndLossDetailedCharts
ProfitAndLoss.Header = ProfitAndLossHeader
ProfitAndLoss.Report = ProfitAndLossReport
ProfitAndLoss.DownloadButton = ProfitAndLossDownloadButton
export { ProfitAndLoss }
