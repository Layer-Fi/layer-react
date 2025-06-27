import {
  DateRange,
  Direction,
  DisplayState,
} from '../../types'
import { TagFilterInput } from '../../types/tags'

export interface NumericRangeFilter {
  min?: number
  max?: number
}

export interface AccountItem {
  id: string
  name: string
}

export type BankTransactionFilters = {
  amount?: NumericRangeFilter
  account?: string[]
  direction?: Direction[]
  categorizationStatus?: DisplayState
  dateRange?: Partial<DateRange>
  query?: string
  tagFilter?: TagFilterInput
}

export type UseBankTransactionsParams = {
  scope?: DisplayState
  monthlyView?: boolean
}
