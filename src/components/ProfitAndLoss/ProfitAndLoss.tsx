import React, { PropsWithChildren, createContext } from 'react'
import { useProfitAndLoss } from '../../hooks/useProfitAndLoss'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { ProfitAndLossTable } from '../ProfitAndLossTable'

const PNLContext = createContext<ReturnType<typeof useProfitAndLoss>>({
  data: undefined,
  isLoading: true,
  error: undefined,
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
