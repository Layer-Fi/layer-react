import { filterVisibility } from '../../components/BankTransactions/utils'
import { BankTransaction, DisplayState } from '../../types/bank_transactions'
import { AccountItem, NumericRangeFilter } from './types'
import { BulkActionSchema } from './useBulkMatchOrCategorize'
import { isCategoryAsOption, isSplitAsOption, isSuggestedMatchAsOption, type BankTransactionCategoryComboBoxOption } from '../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export const collectAccounts = (transactions?: BankTransaction[]) => {
  const accounts: AccountItem[] = []
  if (!transactions) {
    return accounts
  }

  transactions.forEach((x) => {
    if (!accounts.find(y => y.id === x.source_account_id)) {
      accounts.push({
        id: x.source_account_id,
        name: x.account_name || '',
      })
    }
  })

  return accounts.sort((a, b) => a.name.localeCompare(b.name))
}

export const uniqAccountsList = (arr: AccountItem[], track = new Set()) =>
  arr.filter(({ id }) => (track.has(id) ? false : track.add(id)))

export const applyAmountFilter = (
  data?: BankTransaction[],
  filter?: NumericRangeFilter,
) => {
  return data?.filter((x) => {
    if (
      (filter?.min || filter?.min === 0)
      && (filter?.max || filter?.max === 0)
    ) {
      return x.amount >= filter.min * 100 && x.amount <= filter.max * 100
    }

    if (filter?.min || filter?.min === 0) {
      return x.amount >= filter.min * 100
    }

    if (filter?.max || filter?.max === 0) {
      return x.amount <= filter.max * 100
    }
  })
}

export const applyAccountFilter = (
  data?: BankTransaction[],
  filter?: string[],
) => data?.filter(x => filter && filter.includes(x.source_account_id))

export const applyCategorizationStatusFilter = (
  data?: BankTransaction[],
  filter?: DisplayState,
) => {
  if (!filter) {
    return data
  }

  return data?.filter(
    tx =>
      filterVisibility(filter, tx)
      || filter === DisplayState.all
      || (filter === DisplayState.review && tx.recently_categorized)
      || (filter === DisplayState.categorized && tx.recently_categorized),
  )
}

type BulkAction = typeof BulkActionSchema.Type

export const buildBulkMatchOrCategorizePayload = (
  selectedIds: Iterable<string>,
  transactionCategories: Map<string, BankTransactionCategoryComboBoxOption>,
): Record<string, BulkAction> => {
  const transactions: Record<string, BulkAction> = {}

  for (const transactionId of selectedIds) {
    const transactionCategory = transactionCategories.get(transactionId)

    if (!transactionCategory) {
      continue
    }

    // Handle suggested match
    if (isSuggestedMatchAsOption(transactionCategory)) {
      transactions[transactionId] = {
        type: 'match',
        suggestedMatchId: transactionCategory.value,
      }
    }
    // Handle split categorization
    else if (isSplitAsOption(transactionCategory)) {
      const splitEntries = transactionCategory.original
        .map((split) => {
          if (!split.category || !isCategoryAsOption(split.category)) {
            return null
          }
          const classification = split.category.classification
          if (!classification) {
            return null
          }
          return {
            amount: split.amount,
            category: classification,
          }
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

      if (splitEntries.length > 0) {
        transactions[transactionId] = {
          type: 'categorize',
          categorization: {
            type: 'Split',
            entries: splitEntries,
          },
        }
      }
    }
    // Handle single category or API categorization
    else if (isCategoryAsOption(transactionCategory)) {
      const classification = transactionCategory.classification
      if (classification) {
        transactions[transactionId] = {
          type: 'categorize',
          categorization: {
            type: 'Category',
            category: classification,
          },
        }
      }
    }
  }

  return transactions
}
