import React, { PropsWithChildren, createContext } from 'react'
import { DateContext } from '../../contexts/DateContext'
import { PNLComparisonContext } from '../../contexts/ProfitAndLossComparisonContext'
import { useDate } from '../../hooks/useDate'
import { useProfitAndLoss } from '../../hooks/useProfitAndLoss'
import { useProfitAndLossComparison } from '../../hooks/useProfitAndLossComparison'
import { ReportingBasis } from '../../types'
import { Container } from '../Container'
import { ProfitAndLossChart } from '../ProfitAndLossChart'
import { ProfitAndLossCompareOptions } from '../ProfitAndLossCompareOptions'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { ProfitAndLossDetailedCharts } from '../ProfitAndLossDetailedCharts'
import { ProfitAndLossDownloadButton } from '../ProfitAndLossDownloadButton'
import { ProfitAndLossHeader } from '../ProfitAndLossHeader'
import { ProfitAndLossReport } from '../ProfitAndLossReport'
import { ProfitAndLossSummaries } from '../ProfitAndLossSummaries'
import { ProfitAndLossTable } from '../ProfitAndLossTable'
import { endOfMonth, startOfMonth } from 'date-fns'

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
  changeDateRange: () => {},
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
  reportingBasis?: ReportingBasis
  asContainer?: boolean
  dateSyncedWithGlobal?: boolean
}

const ProfitAndLoss = (props: Props) => {
  const dateContextData = useDate({
    supportedModes: [
      'monthPicker',
      'monthRangePicker',
      // 'quarterPicker',
      // 'yearPicker',
    ],
    name: 'PnL provider',
  })

  return (
    <DateContext.Provider value={dateContextData}>
      <ProfitAndLossContent {...props} />
    </DateContext.Provider>
  )
}

const ProfitAndLossContent = ({
  children,
  tagFilter,
  reportingBasis,
  asContainer = true,
  dateSyncedWithGlobal = false,
}: Props) => {
  const contextData = useProfitAndLoss({
    tagFilter,
    reportingBasis,
    dateSyncedWithGlobal,
  })
  const comparisonContextData = useProfitAndLossComparison({ reportingBasis })

  return (
    <PNLContext.Provider value={contextData}>
      <PNLComparisonContext.Provider value={comparisonContextData}>
        {asContainer ? (
          <Container name='profit-and-loss'>{children}</Container>
        ) : (
          children
        )}
      </PNLComparisonContext.Provider>
    </PNLContext.Provider>
  )
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
