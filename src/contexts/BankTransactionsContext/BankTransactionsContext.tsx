import { createContext, useContext } from 'react'
import { BankTransaction, CategoryUpdate } from '../../types'
import { DisplayState } from '../../types'

export type BankTransactionsContextType = {
  data: BankTransaction[] | undefined
  isLoading: boolean
  isValidating: boolean
  isError: boolean
  refetch: () => void
  categorize: (
    bankTransactionId: string,
    newCategory: CategoryUpdate,
    notify?: boolean,
  ) => Promise<void | undefined>
  match: (
    bankTransactionId: string,
    suggestedMatchId: string,
    notify?: boolean,
  ) => Promise<void | undefined>
  metadata: {
    pagination: {
      cursor?: string
      has_more: boolean
    }
  } | undefined
  updateOneLocal: (newBankTransaction: BankTransaction) => void
  shouldHideAfterCategorize: () => boolean
  removeAfterCategorize: (bankTransaction: BankTransaction) => void
  display: DisplayState
  fetchMore: () => void
  hasMore: boolean
}

export const BankTransactionsContext =
  createContext<BankTransactionsContextType>({
    data: undefined,
    isLoading: false,
    isValidating: false,
    isError: false,
    refetch: () => {},
    categorize: () => Promise.resolve(undefined),
    match: () => Promise.resolve(undefined),
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
  })

export const useBankTransactionsContext = () =>
  useContext(BankTransactionsContext)
