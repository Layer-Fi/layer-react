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
    updateLocalBankTransactions: () => undefined,
    shouldHideAfterCategorize: false,
    removeAfterCategorize: () => undefined,
    display: DisplayState.review,
    fetchMore: () => {},
    hasMore: false,
    mutate: () => Promise.resolve(undefined),
    useBankTransactionsOptions: {},
  })

export const useBankTransactionsContext = () =>
  useContext(BankTransactionsContext)
