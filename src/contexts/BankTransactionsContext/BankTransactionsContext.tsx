import { createContext, useContext } from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { DisplayState } from '../../hooks/useBankTransactions/types'

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
    display: DisplayState.review
  })

export const useBankTransactionsContext = () =>
  useContext(BankTransactionsContext)
