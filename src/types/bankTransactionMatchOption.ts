import type { BankTransactionCategoryComboBoxOption } from '@internal-types/bankTransactionCategoryComboBoxOption'
import type { SuggestedMatchAsOption } from '@internal-types/categorizationOption'

export type BankTransactionNonSuggestedMatchOption = Exclude<
  BankTransactionCategoryComboBoxOption,
  SuggestedMatchAsOption
>

/** Whether a transaction is being categorized or matched. */
export enum BankTransactionSelectionVariant {
  MATCH = 'MATCH',
  CATEGORY = 'CATEGORY',
}
