import { DateRange } from '../../types/general'
import { DisplayState } from '../../types/bank_transactions'
import { Direction } from '../../types/general'
import { TagFilterInput } from '../../types/tags'
import { Schema } from 'effect/index'
import { ClassificationSchema } from '../../schemas/categorization'

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

export const SingleCategoryUpdateSchema = Schema.Struct({
  type: Schema.Literal('Category'),
  category: ClassificationSchema,
})

export const SplitCategoryEntrySchema = Schema.Struct({
  amount: Schema.Number,
  category: ClassificationSchema,
})

export const SplitCategoryUpdateSchema = Schema.Struct({
  type: Schema.Literal('Split'),
  entries: Schema.Array(SplitCategoryEntrySchema),
})

export const CategoryUpdateSchema = Schema.Union(
  SingleCategoryUpdateSchema,
  SplitCategoryUpdateSchema,
)
