import { createContext, useContext } from 'react'

import {
  type BankTransactionFilters,
  type BankTransactionsDateFilterMode,
} from '@hooks/useBankTransactions/types'

export type BankTransactionsFiltersContextType = {
  filters: BankTransactionFilters
  setFilters: (filters: BankTransactionFilters) => void
  dateFilterMode?: BankTransactionsDateFilterMode
}

export const BankTransactionsFiltersContext =
  createContext<BankTransactionsFiltersContextType>({
    filters: {},
    setFilters: () => {},
    dateFilterMode: undefined,
  })

export const useBankTransactionsFiltersContext = () =>
  useContext(BankTransactionsFiltersContext)
