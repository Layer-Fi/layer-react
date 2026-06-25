import { createContext, useContext } from 'react'

import { DisplayState } from '@internal-types/bankTransactions'
import { type useAugmentedBankTransactions } from '@hooks/features/bankTransactions/useAugmentedBankTransactions'
import { type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

export type BankTransactionsContextType = ReturnType<typeof useAugmentedBankTransactions> & {
  isMonthlyViewMode: boolean
  paginationProps: TablePaginationProps
}

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
    isMonthlyViewMode: false,
    paginationProps: {},
  })

export const useBankTransactionsContext = () =>
  useContext(BankTransactionsContext)
