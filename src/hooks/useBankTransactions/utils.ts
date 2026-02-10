import { type BankTransaction, DisplayState, type Split } from '@internal-types/bank_transactions'
import type { CategoryUpdate } from '@schemas/bankTransactions/categoryUpdate'
import { type AccountItem, type NumericRangeFilter } from '@hooks/useBankTransactions/types'
import { type MatchOrCategorizeTransactionRequestSchema } from '@hooks/useBankTransactions/useBulkMatchOrCategorize'
import { type BankTransactionCategoryComboBoxOption, isApiCategorizationAsOption, isCategoryAsOption, isPlaceholderAsOption, isSplitAsOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { filterVisibility } from '@components/BankTransactions/utils'
import { makeTagKeyValueFromTag } from '@features/tags/tagSchemas'

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

type MatchOrCategorizeTransaction = typeof MatchOrCategorizeTransactionRequestSchema.Type

export const buildBulkMatchOrCategorizePayload = (
  selectedIds: Iterable<string>,
  transactionCategories: Map<string, BankTransactionCategoryComboBoxOption | null>,
): Record<string, MatchOrCategorizeTransaction> => {
  const transactions: Record<string, MatchOrCategorizeTransaction> = {}

  for (const transactionId of selectedIds) {
    const transactionCategory = transactionCategories.get(transactionId) ?? null

    if (!transactionCategory || isPlaceholderAsOption(transactionCategory)) {
      continue
    }

    if (isSuggestedMatchAsOption(transactionCategory)) {
      transactions[transactionId] = {
        type: 'match',
        suggestedMatchId: transactionCategory.value,
      }
    }

    else if (isSplitAsOption(transactionCategory)) {
      const splitEntries = transactionCategory.original
        .map((split) => {
          if (!split.category || !(isCategoryAsOption(split.category) || isApiCategorizationAsOption(split.category))) {
            return null
          }
          const classification = split.category.classification
          if (!classification) {
            return null
          }
          return {
            amount: split.amount,
            category: classification,
            tags: split.tags,
            customerId: split.customerVendor?.customerVendorType === 'CUSTOMER' ? split.customerVendor.id : undefined,
            vendorId: split.customerVendor?.customerVendorType === 'VENDOR' ? split.customerVendor.id : undefined,
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

    else if (isCategoryAsOption(transactionCategory) || isApiCategorizationAsOption(transactionCategory)) {
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

export const buildCategorizeBankTransactionPayloadForSplit = (splits: Split[]): CategoryUpdate => {
  const firstSplit = splits[0]
  return splits.length === 1 && firstSplit?.category
    ? ({
      type: 'Category',
      category: firstSplit.category.classification!,
    })
    : ({
      type: 'Split',
      entries: splits.map(split => ({
        // TODO: enforce upstream in the category combobox that split.category is non-null
        category: split.category!.classification!,
        amount: split.amount,
        tags: split.tags.map(tag => makeTagKeyValueFromTag(tag)),
        customerId: split.customerVendor?.customerVendorType === 'CUSTOMER' ? split.customerVendor.id : undefined,
        vendorId: split.customerVendor?.customerVendorType === 'VENDOR' ? split.customerVendor.id : undefined,
      })),
    })
}
