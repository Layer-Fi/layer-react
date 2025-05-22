import { BankTransaction, type CategoryWithEntries } from '../../types/bank_transactions'

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
  category?: string
  stable_name?: string
  entries?: CategoryWithEntries['entries']
  subCategories: CategoryOption[] | null
}

export type CategoryOption = {
  type: string
  disabled?: boolean
  payload: CategoryOptionPayload
}

export type CategorySelectProps = {
  name?: string
  bankTransaction: BankTransaction
  value: CategoryOption | undefined
  onChange: (newValue: CategoryOption) => void
  disabled?: boolean
  className?: string
  showTooltips: boolean
  excludeMatches?: boolean
  asDrawer?: boolean
}
