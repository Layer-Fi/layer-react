import {
  BankTransaction,
  CategoryUpdate,
  DateRange,
  Direction,
  DisplayState,
  Metadata,
} from '../../types'
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
  account?: string[]
  direction?: Direction[]
  categorizationStatus?: DisplayState
  dateRange?: Partial<DateRange>
}

export type UseBankTransactions = (params?: { scope?: DisplayState }) => {
  data?: BankTransaction[]
  metadata: Metadata
  loadingStatus: LoadedStatus
  isLoading: boolean
  isValidating: boolean
  error: unknown
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
  refetch: () => void
  setFilters: (filters?: Partial<BankTransactionFilters>) => void
  activate: () => void
  fetchMore: () => void
}
