import { createContext, useContext } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'

export type BankTransactionsContextType = ReturnType<typeof useBankTransactions>
export const BankTransactionsContext =
  createContext<BankTransactionsContextType>({
    data: undefined,
    isLoading: false,
    loadingStatus: 'initial',
    isValidating: false,
    error: undefined,
    refetch: () => {},
    categorize: () => Promise.resolve(undefined),
    match: () => Promise.resolve(undefined),
    filters: undefined,
    setFilters: () => {},
    metadata: {
      pagination: undefined,
    },
    updateOneLocal: () => undefined,
    activate: () => undefined,
  })

export const useBankTransactionsContext = () =>
  useContext(BankTransactionsContext)
