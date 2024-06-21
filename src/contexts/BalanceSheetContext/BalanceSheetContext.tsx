import { createContext } from 'react'
import { useBalanceSheet } from '../../hooks/useBalanceSheet'

export type BalanceSheetContextType = ReturnType<typeof useBalanceSheet>
export const BalanceSheetContext = createContext<BalanceSheetContextType>({
  data: undefined,
  isLoading: false,
  error: undefined,
})
