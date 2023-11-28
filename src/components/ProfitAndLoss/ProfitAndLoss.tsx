import React, { PropsWithChildren, createContext } from 'react'
import { useProfitAndLoss } from '../../hooks/useProfitAndLoss'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { ProfitAndLossTable } from '../ProfitAndLossTable'
import { endOfMonth, startOfMonth } from 'date-fns'

const PNLContext = createContext<ReturnType<typeof useProfitAndLoss>>({
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
      <div className="Layer__profit-and-loss">{children}</div>
    </PNLContext.Provider>
  )
}

ProfitAndLoss.DatePicker = ProfitAndLossDatePicker
ProfitAndLoss.Table = ProfitAndLossTable
ProfitAndLoss.Context = PNLContext
export { ProfitAndLoss }
