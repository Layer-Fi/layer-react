import { createContext } from 'react'
import { useProfitAndLossComparison } from '../../hooks/useProfitAndLossComparison'
import { S3PresignedUrl } from '../../types/general'

type PNLComparisonContextType = ReturnType<typeof useProfitAndLossComparison>
export const PNLComparisonContext = createContext<PNLComparisonContextType>({
  data: undefined,
  isLoading: true,
  isValidating: false,
  error: undefined,
  rangeDisplayMode: 'monthPicker',
  setRangeDisplayMode: () => {},
  compareMode: false,
  setCompareMode: () => {},
  comparePeriods: 0,
  setComparePeriods: () => {},
  compareOptions: [],
  setCompareOptions: function (): void {
    throw new Error('Function not implemented.')
  },
  refetch: function (): void {
    throw new Error('Function not implemented.')
  },
  getProfitAndLossComparisonCsv: function (): Promise<{
    data?: S3PresignedUrl
    error?: unknown
  }> {
    throw new Error('Function not implemented.')
  },
})
