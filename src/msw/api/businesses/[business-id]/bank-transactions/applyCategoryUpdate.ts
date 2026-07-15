import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { type CategoryUpdate, type SplitCategoryEntrySchema } from '@schemas/bankTransactions/categoryUpdate'
import { type SplitCategorizationEntrySchema } from '@schemas/categorization'
import { type TransactionTag } from '@schemas/tag'

import { categorizationFromClassification } from '@msw/api/businesses/[business-id]/bank-transactions/categorizationFromClassification'

type SplitEntry = typeof SplitCategorizationEntrySchema.Type
type SplitCategoryEntry = typeof SplitCategoryEntrySchema.Type

const toTransactionTag = ({ key, value, dimensionDisplayName, valueDisplayName }: {
  key: string
  value: string
  dimensionDisplayName?: string | null
  valueDisplayName?: string | null
}): TransactionTag => {
  const now = new Date()

  return {
    id: crypto.randomUUID(),
    key,
    value,
    dimensionDisplayName: dimensionDisplayName ?? null,
    valueDisplayName: valueDisplayName ?? null,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    deletedAt: null,
  }
}

const toSplitEntry = (entry: SplitCategoryEntry): SplitEntry => {
  const category = categorizationFromClassification(entry.category)
  const shared = {
    amount: entry.amount,
    taxCode: entry.taxCode ?? null,
    tags: (entry.tags ?? []).map(toTransactionTag),
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
  match: null,
})
