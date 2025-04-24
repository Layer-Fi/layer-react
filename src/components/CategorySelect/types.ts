import { Category } from '../../types/categories'
import { type CategoryWithEntries } from '../../types/bank_transactions'

export enum OptionActionType {
  CATEGORY = 'category',
  MATCH = 'match',
  HIDDEN = 'hidden',
}

export type CategoryOptionPayload = {
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
}

export type CategoryOption = {
  type: string // 'category' | 'match'
  disabled?: boolean
  payload: CategoryOptionPayload
}

export type CategoryWithHide = Category & { hide?: boolean }
