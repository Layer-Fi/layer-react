import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { type CategoryUpdate, type SplitCategoryEntrySchema } from '@schemas/bankTransactions/categoryUpdate'
import { type SplitCategorizationEntrySchema } from '@schemas/categorization'

import { categorizationFromClassification } from '@msw/api/businesses/[business-id]/bank-transactions/categorizationFromClassification'
import { transactionTagFromKeyValue } from '@msw/api/businesses/[business-id]/bank-transactions/transactionTagFromKeyValue'

type SplitEntry = typeof SplitCategorizationEntrySchema.Type
type SplitCategoryEntry = typeof SplitCategoryEntrySchema.Type

const toSplitEntry = (entry: SplitCategoryEntry): SplitEntry => {
  const category = categorizationFromClassification(entry.category)
  const shared = {
    amount: entry.amount,
    taxCode: entry.taxCode ?? null,
    tags: (entry.tags ?? []).map(transactionTagFromKeyValue),
  }

  return category.type === 'Exclusion'
    ? { type: 'ExclusionSplitEntry', category, ...shared }
    : { type: 'AccountSplitEntry', category, ...shared }
}

export const applyCategoryUpdate = (
  transaction: BankTransaction,
  update: CategoryUpdate,
): BankTransaction => {
  if (update.type === 'Split') {
    return {
      ...transaction,
      categorizationStatus: CategorizationStatus.SPLIT,
      category: {
        type: 'Split_Categorization',
        id: `split-${transaction.id}`,
        category: 'SPLIT',
        displayName: 'Split',
        entries: update.entries.map(toSplitEntry),
      },
      // Splits carry per-entry tax codes, so the transaction-level one is cleared.
      taxCode: null,
      categorizationFlow: null,
      match: null,
      suggestedMatches: [],
    }
  }

  return {
    ...transaction,
    categorizationStatus: CategorizationStatus.CATEGORIZED,
    category: categorizationFromClassification(update.category),
    taxCode: update.taxCode ?? transaction.taxCode,
    categorizationFlow: null,
    match: null,
    suggestedMatches: [],
  }
}

export const applyUncategorize = (transaction: BankTransaction): BankTransaction => ({
  ...transaction,
  categorizationStatus: CategorizationStatus.READY_FOR_INPUT,
  category: null,
  categorizationFlow: null,
  taxCode: null,
  match: null,
  suggestedMatches: [],
})
