import { createContext, useContext } from 'react'

import { type BankTransactionFilters } from '@utils/bankTransactions'
import { type BankTransactionsDateFilterMode } from '@utils/bankTransactions'

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
