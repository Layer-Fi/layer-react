import { createContext, useContext } from 'react'

import { DisplayState } from '@internal-types/bankTransactions'
import { type useAugmentedBankTransactions } from '@hooks/features/bankTransactions/useAugmentedBankTransactions'

export type BankTransactionsContextType = ReturnType<typeof useAugmentedBankTransactions>

export const BankTransactionsContext =
  createContext<BankTransactionsContextType>({
    data: undefined,
    isLoading: false,
    isError: false,
    updateLocalBankTransactions: () => undefined,
    removeFromCache: () => undefined,
    shouldHideAfterCategorize: false,
    display: DisplayState.review,
    fetchMore: () => {},
    hasMore: false,
    mutate: () => Promise.resolve(undefined),
    useBankTransactionsOptions: {},
  })

export const useBankTransactionsContext = () =>
  useContext(BankTransactionsContext)
