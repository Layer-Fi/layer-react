import { createContext, useContext } from 'react'

import { type BankTransactionFilters } from '@components/BankTransactions/bankTransactions'
import { type BankTransactionsDateFilterMode } from '@components/BankTransactions/bankTransactions'

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
