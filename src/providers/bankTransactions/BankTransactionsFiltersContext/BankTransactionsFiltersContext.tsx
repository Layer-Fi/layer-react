import { createContext, useContext } from 'react'

import { type BankTransactionFilters, type BankTransactionsDateFilterMode } from '@utils/bankTransactions/shared'

export type BankTransactionsFiltersContextType = {
  filters: BankTransactionFilters
  setFilters: (filters: BankTransactionFilters) => void
  dateFilterMode?: BankTransactionsDateFilterMode
  isMonthlyViewMode: boolean
}

export const BankTransactionsFiltersContext =
  createContext<BankTransactionsFiltersContextType>({
    filters: {},
    setFilters: () => {},
    dateFilterMode: undefined,
    isMonthlyViewMode: false,
  })

export const useBankTransactionsFiltersContext = () =>
  useContext(BankTransactionsFiltersContext)
