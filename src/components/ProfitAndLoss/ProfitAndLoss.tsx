import React, { PropsWithChildren, createContext } from 'react'
import { useProfitAndLoss } from '../../hooks/useProfitAndLoss'
import { ProfitAndLossChart } from '../ProfitAndLossChart'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { ProfitAndLossSummaries } from '../ProfitAndLossSummaries'
import { ProfitAndLossTable } from '../ProfitAndLossTable'
import { endOfMonth, startOfMonth } from 'date-fns'

type PNLContextType = ReturnType<typeof useProfitAndLoss>
const PNLContext = createContext<PNLContextType>({
  data: undefined,
  isLoading: true,
  error: undefined,
  dateRange: {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
  changeDateRange: () => {},
})

const ProfitAndLoss = ({ children }: PropsWithChildren) => {
  const contextData = useProfitAndLoss()
  return (
    <PNLContext.Provider value={contextData}>
      <div className="Layer__profit-and-loss">
        <h2 className="Layer__profit-and-loss__title">Profit & Loss</h2>
        {children}
      </div>
    </PNLContext.Provider>
  )
}

ProfitAndLoss.Chart = ProfitAndLossChart
ProfitAndLoss.Context = PNLContext
ProfitAndLoss.DatePicker = ProfitAndLossDatePicker
ProfitAndLoss.Summaries = ProfitAndLossSummaries
ProfitAndLoss.Table = ProfitAndLossTable
export { ProfitAndLoss }
