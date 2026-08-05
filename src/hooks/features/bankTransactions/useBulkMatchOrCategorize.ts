import { useCallback } from 'react'

import { type BankTransactionCategoryComboBoxOption, isApiCategorizationAsOption, isCategoryAsOption, isPlaceholderAsOption, isSplitAsOption } from '@internal-types/bankTransactionCategoryComboBoxOption'
import { type Split } from '@internal-types/bankTransactions'
import {
  type BulkMatchOrCategorizeRequest,
  type MatchOrCategorizeTransactionRequestSchema,
} from '@schemas/features/bankTransactions/bulkMatchOrCategorize'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useSelectedIds } from '@providers/common/BulkSelectionStore/BulkSelectionStoreProvider'
import { usePostBulkMatchOrCategorize } from '@api/businesses/[business-id]/bank-transactions/bulk-match-or-categorize/post'
import { type BankTransactionCategorization, BankTransactionSelectionVariant, DEFAULT_CATEGORIZATION, useGetAllBankTransactionsCategorizations } from '@providers/features/categorization/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'

type MatchOrCategorizeTransaction = typeof MatchOrCategorizeTransactionRequestSchema.Type

const getClassification = (category: BankTransactionCategoryComboBoxOption | null) => {
  if (!category || !(isCategoryAsOption(category) || isApiCategorizationAsOption(category))) {
    return null
  }
  return category.classification
}

const toSplitEntry = (split: Split) => {
  const classification = getClassification(split.category)
  if (!classification) return null
  return {
    amount: split.amount,
    category: classification,
    taxCode: split.taxCode,
    tags: split.tags,
    customerId: split.customerVendor?.customerVendorType === 'CUSTOMER' ? split.customerVendor.id : undefined,
    vendorId: split.customerVendor?.customerVendorType === 'VENDOR' ? split.customerVendor.id : undefined,
  }
}

const buildBulkMatchOrCategorizePayload = (
  selectedIds: Iterable<string>,
  categorizations: ReadonlyMap<string, BankTransactionCategorization>,
): Record<string, MatchOrCategorizeTransaction> => {
  const transactions: Record<string, MatchOrCategorizeTransaction> = {}

  for (const transactionId of selectedIds) {
    const { category, match, taxCode, variant } = categorizations.get(transactionId) ?? DEFAULT_CATEGORIZATION

    if (variant === BankTransactionSelectionVariant.MATCH) {
      if (!match) continue

      transactions[transactionId] = {
        type: 'match',
        suggestedMatchId: match.original.id,
      }
      continue
    }

    if (!category || isPlaceholderAsOption(category)) {
      continue
    }

    if (isSplitAsOption(category)) {
      const splitEntries = category.original
        .map(toSplitEntry)
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
      continue
    }

    const classification = getClassification(category)
    if (!classification) continue

    transactions[transactionId] = {
      type: 'categorize',
      categorization: {
        type: 'Category',
        category: classification,
        taxCode: taxCode ?? null,
      },
    }
  }

  return transactions
}

export const useBulkMatchOrCategorize = () => {
  const { selectedIds } = useSelectedIds()
  const { categorizations } = useGetAllBankTransactionsCategorizations()
  const { eventCallbacks } = useLayerContext()

  const buildTransactionsPayload: () => BulkMatchOrCategorizeRequest = useCallback(() => {
    const transactions = buildBulkMatchOrCategorizePayload(selectedIds, categorizations)
    return { transactions }
  }, [selectedIds, categorizations])

  const response = usePostBulkMatchOrCategorize({
    swrOptions: {
      onSuccess: () => {
        eventCallbacks?.onTransactionCategorized?.()
      },
    },
  })

  return {
    response,
    buildTransactionsPayload,
  }
}
