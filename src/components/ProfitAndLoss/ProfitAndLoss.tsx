import React, { PropsWithChildren, createContext } from 'react'
import { useProfitAndLoss } from '../../hooks/useProfitAndLoss'
import { ReportingBasis } from '../../types'
import { ProfitAndLossChart } from '../ProfitAndLossChart'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { ProfitAndLossSummaries } from '../ProfitAndLossSummaries'
import { ProfitAndLossTable } from '../ProfitAndLossTable'
import { endOfMonth, startOfMonth } from 'date-fns'

type PNLContextType = ReturnType<typeof useProfitAndLoss>
const PNLContext = createContext<PNLContextType>({
  data: undefined,
  filteredData: [],
  filteredTotal: undefined,
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
})

type Props = PropsWithChildren & {
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
}

const ProfitAndLoss = ({ children, tagFilter, reportingBasis }: Props) => {
  const contextData = useProfitAndLoss({ tagFilter, reportingBasis })
  return (
    <PNLContext.Provider value={contextData}>
      <div className='Layer__component Layer__profit-and-loss'>{children}</div>
    </PNLContext.Provider>
  )
}

ProfitAndLoss.Chart = ProfitAndLossChart
ProfitAndLoss.Context = PNLContext
ProfitAndLoss.DatePicker = ProfitAndLossDatePicker
ProfitAndLoss.Summaries = ProfitAndLossSummaries
ProfitAndLoss.Table = ProfitAndLossTable
export { ProfitAndLoss }
