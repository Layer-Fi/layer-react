import { createContext, useContext } from 'react'
import { useAugmentedBankTransactions } from '../../hooks/useBankTransactions/useAugmentedBankTransactions'
import { DisplayState } from '../../types'

export type BankTransactionsContextType = ReturnType<typeof useAugmentedBankTransactions>
export const BankTransactionsContext =
  createContext<BankTransactionsContextType>({
    data: undefined,
    isLoading: false,
    isValidating: false,
    isError: false,
    refetch: () => {},
    categorize: () => Promise.resolve(undefined),
    match: () => Promise.resolve(undefined),
    filters: {},
    setFilters: () => {},
    dateFilterMode: undefined,
    metadata: {
      pagination: {
        cursor: undefined,
        has_more: false,
      },
    },
    updateOneLocal: () => undefined,
    shouldHideAfterCategorize: () => false,
    removeAfterCategorize: () => undefined,
    display: DisplayState.review,
    fetchMore: () => {},
    hasMore: false,
    accountsList: [],
  })

export const useBankTransactionsContext = () =>
  useContext(BankTransactionsContext)
