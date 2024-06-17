import { BankTransaction, CategoryUpdate, Metadata } from '../../types'
import { LoadedStatus } from '../../types/general'

export interface NumericRangeFilter {
  min?: number
  max?: number
}

export interface AccountItem {
  id: string
  name: string
}

export interface BankTransactionFilters {
  amount?: NumericRangeFilter
}

export type UseBankTransactions = () => {
  data?: BankTransaction[]
  metadata: Metadata
  loadingStatus: LoadedStatus
  isLoading: boolean
  isValidating: boolean
  error: unknown
  filters?: BankTransactionFilters
  accountsList?: AccountItem[]
  categorize: (
    id: BankTransaction['id'],
    newCategory: CategoryUpdate,
    notify?: boolean,
  ) => Promise<void>
  match: (
    id: BankTransaction['id'],
    matchId: BankTransaction['id'],
    notify?: boolean,
  ) => Promise<void>
  updateOneLocal: (bankTransaction: BankTransaction) => void
  refetch: () => void
  setFilters: (filters?: BankTransactionFilters) => void
  activate: () => void
}
