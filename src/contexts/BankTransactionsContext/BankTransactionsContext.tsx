import { createContext, useContext } from 'react'

import { DisplayState } from '@internal-types/bank_transactions'
import { type useAugmentedBankTransactions } from '@hooks/useBankTransactions/useAugmentedBankTransactions'

export type BankTransactionsContextType = ReturnType<typeof useAugmentedBankTransactions>

export const BankTransactionsContext =
  createContext<BankTransactionsContextType>({
    data: undefined,
    isLoading: false,
    isValidating: false,
    isError: false,
    refetch: () => {},
    categorize: () => Promise.resolve(),
    match: () => Promise.resolve(),
    metadata: {
      pagination: {
        cursor: undefined,
        has_more: false,
      },
    },
    updateLocalBankTransactions: () => undefined,
    shouldHideAfterCategorize: () => false,
    removeAfterCategorize: () => undefined,
    display: DisplayState.review,
    fetchMore: () => {},
    hasMore: false,
  })

export const useBankTransactionsContext = () =>
  useContext(BankTransactionsContext)
