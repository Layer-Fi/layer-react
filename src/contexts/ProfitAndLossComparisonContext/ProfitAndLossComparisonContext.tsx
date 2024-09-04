import { createContext } from 'react'
import { useProfitAndLossComparison } from '../../hooks/useProfitAndLossComparison/useProfitAndLossComparison'

type PNLComparisonContextType = ReturnType<typeof useProfitAndLossComparison>
export const PNLComparisonContext = createContext<PNLComparisonContextType>({
  data: undefined,
  isLoading: true,
  isValidating: false,
  error: undefined,
  compareMode: false,
  setCompareMode: () => {},
  compareMonths: 0,
  setCompareMonths: () => {},
  compareOptions: [],
  setCompareOptions: function (): void {
    throw new Error('Function not implemented.')
  },
  refetch: function (): void {
    throw new Error('Function not implemented.')
  },
})
