import type { SuggestedMatchAsOption } from '@internal-types/categorizationOption'
import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export type BankTransactionNonSuggestedMatchOption = Exclude<
  BankTransactionCategoryComboBoxOption,
  SuggestedMatchAsOption
>
