import {
  BankTransaction,
  CategoryUpdate,
  DateRange,
  Direction,
  DisplayState,
  Metadata,
} from '../../types'
import { LoadedStatus } from '../../types/general'
import { TagFilterInput } from '../../types/tags'

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
  account?: string[]
  direction?: Direction[]
  categorizationStatus?: DisplayState
  dateRange?: Partial<DateRange>
  tagFilter?: TagFilterInput
}

export type UseBankTransactionsParams = {
  scope?: DisplayState
  monthlyView?: boolean
}

export type UseBankTransactions = (params?: UseBankTransactionsParams) => {
  data?: BankTransaction[]
  metadata?: Metadata
  loadingStatus: LoadedStatus
  isLoading: boolean
  isValidating: boolean
  error: unknown
  hasMore?: boolean
  filters?: BankTransactionFilters
  accountsList?: AccountItem[]
  display: DisplayState
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
  shouldHideAfterCategorize: (bankTransaction: BankTransaction) => boolean
  removeAfterCategorize: (bankTransaction: BankTransaction) => void
  refetch: () => void
  setFilters: (filters?: Partial<BankTransactionFilters>) => void
  activate: () => void
  fetchMore: () => void
}
