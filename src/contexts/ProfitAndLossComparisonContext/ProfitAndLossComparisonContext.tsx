import { createContext } from 'react'
import { useProfitAndLossComparison } from '../../hooks/useProfitAndLossComparison/useProfitAndLossComparison'
import { endOfMonth, startOfMonth } from 'date-fns'

type PNLComparisonContextType = ReturnType<typeof useProfitAndLossComparison>
export const PNLComparisonContext = createContext<PNLComparisonContextType>({
  data: undefined,
  isLoading: true,
  isValidating: false,
  error: undefined,
  dateRange: {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
  changeDateRange: () => {},
  compareMode: false,
  setCompareMode: () => {},
  compareMonths: 0,
  setCompareMonths: () => {},
  compareOptions: [],
  setCompareOptions: function (options: string[]): void {
    throw new Error('Function not implemented.')
  },
})
