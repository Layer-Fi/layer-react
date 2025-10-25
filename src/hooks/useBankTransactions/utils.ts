import { Schema } from 'effect'
import { filterVisibility } from '../../components/BankTransactions/utils'
import { BankTransaction, DisplayState } from '../../types/bank_transactions'
import { AccountItem, NumericRangeFilter } from './types'
import { OptionActionType, CategoryOption } from '../../types/categoryOption'
import { getCategorizePayload } from '../../utils/bankTransactions'
import { mapCategoryToOption } from '../../components/CategorySelect/CategorySelect'
import { ClassificationSchema } from '../../schemas/categorization'
import { BulkActionSchema } from './useBulkMatchOrCategorize'

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
  transactionCategories: Map<string, CategoryOption>,
): Record<string, BulkAction> => {
  const transactions: Record<string, BulkAction> = {}

  for (const transactionId of selectedIds) {
    const transactionCategory: CategoryOption | undefined = transactionCategories.get(transactionId)

    if (!transactionCategory) {
      continue
    }

    if (transactionCategory.payload.option_type === OptionActionType.MATCH) {
      transactions[transactionId] = {
        type: 'match',
        suggestedMatchId: transactionCategory.payload.id,
      }
    }
    else if (transactionCategory.payload.option_type === OptionActionType.CATEGORY) {
      // Split Categorization
      if (transactionCategory.payload.entries && transactionCategory.payload.entries.length > 0) {
        transactions[transactionId] = {
          type: 'categorize',
          categorization: {
            type: 'Split',
            entries: transactionCategory.payload.entries.map((entry) => {
              const categoryPayload = getCategorizePayload(mapCategoryToOption(entry.category))
              return {
                amount: entry.amount ?? 0,
                category: Schema.decodeSync(ClassificationSchema)(categoryPayload),
              }
            }),
          },
        }
      }
      else {
        // Single Categorization
        const categoryPayload = getCategorizePayload(transactionCategory)
        transactions[transactionId] = {
          type: 'categorize',
          categorization: {
            type: 'Category',
            category: Schema.decodeSync(ClassificationSchema)(categoryPayload),
          },
        }
      }
    }
  }

  return transactions
}
