import { createContext } from 'react'

import { type S3PresignedUrl } from '@internal-types/general'
import { type useProfitAndLossComparison } from '@hooks/useProfitAndLossComparison/useProfitAndLossComparison'

export const ProfitAndLossComparisonContext = createContext<ReturnType<typeof useProfitAndLossComparison>>({
  data: undefined,
  isLoading: true,
  isValidating: false,
  compareModeActive: false,
  comparePeriods: 0,
  compareOptions: [],
  selectedCompareOptions: [],
  setSelectedCompareOptions: function (): void {
    throw new Error('Function not implemented.')
  },
  getProfitAndLossComparisonCsv: function (): Promise<{
    data?: S3PresignedUrl
    error?: unknown
  }> {
    throw new Error('Function not implemented.')
  },
  comparisonConfig: undefined,
  comparisonPeriodMode: null,
  setComparisonPeriodMode: () => {},
})
