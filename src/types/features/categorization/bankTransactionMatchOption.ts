import type { BankTransactionCategoryComboBoxOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import type { SuggestedMatchAsOption } from '@internal-types/features/categorization/categorizationOption'

export type BankTransactionNonSuggestedMatchOption = Exclude<
  BankTransactionCategoryComboBoxOption,
  SuggestedMatchAsOption
>

/** Whether a transaction is being categorized or matched. */
export enum BankTransactionSelectionVariant {
  MATCH = 'MATCH',
  CATEGORY = 'CATEGORY',
}
