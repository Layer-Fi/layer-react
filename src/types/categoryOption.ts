import type { CategoryWithEntries } from './bank_transactions'
import type { Category } from './categories'
import type { MatchDetailsType } from '../schemas/bankTransactions/match'

export enum OptionActionType {
  CATEGORY = 'category',
  MATCH = 'match',
  HIDDEN = 'hidden',
  SUGGESTIONS_LOADING = 'suggestions loading',
}

export interface CategoryOptionPayload {
  id: string
  option_type: OptionActionType
  display_name: string
  description?: string
  date?: string
  amount?: number
  type?: string
  stable_name?: string
  entries?: CategoryWithEntries['entries']
  subCategories: Category[] | null
  details?: MatchDetailsType
}

export interface CategoryOption {
  type: string
  disabled?: boolean
  payload: CategoryOptionPayload
}
