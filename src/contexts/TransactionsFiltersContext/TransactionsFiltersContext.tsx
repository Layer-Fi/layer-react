import { createContext, useContext } from 'react'
import {
  BankTransactionFilters,
  BankTransactionsDateFilterMode,
} from '../../hooks/useBankTransactions/types'
import { AccountItem } from '../../hooks/useBankTransactions/types'

export type TransactionsFiltersContextType = {
  filters: BankTransactionFilters
  setFilters: (filters: BankTransactionFilters) => void
  dateFilterMode?: BankTransactionsDateFilterMode
  accountsList: AccountItem[]
}

export const TransactionsFiltersContext =
  createContext<TransactionsFiltersContextType>({
    filters: {},
    setFilters: () => {},
    dateFilterMode: undefined,
    accountsList: [],
  })

export const useTransactionsFiltersContext = () =>
  useContext(TransactionsFiltersContext)
