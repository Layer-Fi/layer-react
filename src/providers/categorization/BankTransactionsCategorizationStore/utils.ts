import type { BankTransactionCategoryComboBoxOption } from '@internal-types/bankTransactionCategoryComboBoxOption'
import type { SuggestedMatchAsOption } from '@internal-types/categorizationOption'

export type BankTransactionNonSuggestedMatchOption = Exclude<
  BankTransactionCategoryComboBoxOption,
  SuggestedMatchAsOption
>
