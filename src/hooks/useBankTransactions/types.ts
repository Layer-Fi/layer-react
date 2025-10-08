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
  dateRange?: DateRange
  query?: string
  tagFilter?: TagFilterInput
}

export enum BankTransactionsDateFilterMode {
  MonthlyView = 'MonthlyView',
  GlobalDateRange = 'GlobalDateRange',
}
