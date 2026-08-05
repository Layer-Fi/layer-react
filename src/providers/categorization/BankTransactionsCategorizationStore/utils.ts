import type { BankTransactionCategoryComboBoxOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import type { SuggestedMatchAsOption } from '@internal-types/features/categorization/categorizationOption'

export type BankTransactionNonSuggestedMatchOption = Exclude<
  BankTransactionCategoryComboBoxOption,
  SuggestedMatchAsOption
>
