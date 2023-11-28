export { OAuthResponse } from './types/authentication'
export {
  LayerContextValues,
  LayerContextActionName,
  LayerContextAction,
} from './types/layer_context'
export { Metadata } from './types/api'
export { ProfitAndLoss, LineItem } from './types/profit_and_loss'

export enum CategorizationStatus {
  PENDING = 'PENDING',
  READY_FOR_INPUT = 'READY_FOR_INPUT',
  LAYER_REVIEW = 'LAYER_REVIEW',
  CATEGORIZED = 'CATEGORIZED',
  SPLIT = 'SPLIT',
  JOURNALING = 'JOURNALING',
}

export enum Direction {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export interface Category {
  id: string
  type: string
  display_name: string
  category: string
  stable_name?: string
  subCategories?: Category[]
}

export enum CategorizationType {
  AUTO = 'AUTO',
  ASK_FROM_SUGGESTIONS = 'ASK_FROM_SUGGESTIONS',
  MEALS = 'MEALS',
  BUSINESS_TRAVEL_TRANSPORTATION = 'BUSINESS_TRAVEL_TRANSPORTATION',
}

export interface AutoCategorization {
  type: CategorizationType.AUTO
  category: Category
}

export interface SuggestedCategorization {
  type: CategorizationType
  suggestions: Category[]
}

// This isn't my favorite but BankTransaction contains much more than
// we're using right now.
export interface BankTransaction extends Record<string, unknown> {
  type: 'Bank_Transaction'
  business_id: string
  id: string
  date: string
  source: string
  source_transaction_id: string
  source_account_id: string
  imported_at: string
  description: string | null
  amount: number
  direction: Direction
  counterparty_name: string
  category: Category
  categorization_status: CategorizationStatus
  categorization_flow: AutoCategorization | SuggestedCategorization
  categorization_method: string
}

export type SingleCategoryUpdate = {
  type: 'Category'
  category: {
    type: 'StableName'
    stable_name: string
  }
}
export type SplitCategoryUpdate = {
  type: 'Split'
  entries: {
    category: string
    amount: number
  }[]
}
export type CategoryUpdate = SingleCategoryUpdate | SplitCategoryUpdate

// Only Date and string (ISO8601 formatted) make sense here
export type DateRange<T = Date> = {
  startDate: T
  endDate: T
}
