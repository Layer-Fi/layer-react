import { useCallback } from 'react'
import { Schema } from 'effect'

import { type Split } from '@internal-types/bankTransactions'
import {
  type BulkMatchOrCategorizeRequest,
  type BulkMatchOrCategorizeRequestEncoded,
  BulkMatchOrCategorizeRequestSchema,
  type MatchOrCategorizeTransactionRequestSchema,
} from '@schemas/bankTransactions/bulkMatchOrCategorize'
import { post } from '@utils/api/authenticatedHttp'
import { useBulkBankTransactionsTriggerSuccess } from '@hooks/api/businesses/[business-id]/bank-transactions/useBulkBankTransactionsTriggerSuccess'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { type BankTransactionCategorization, BankTransactionSelectionVariant, DEFAULT_CATEGORIZATION, useGetAllBankTransactionsCategorizations } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { type BankTransactionCategoryComboBoxOption, isApiCategorizationAsOption, isCategoryAsOption, isPlaceholderAsOption, isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

const BULK_MATCH_OR_CATEGORIZE_TAG = '#bulk-match-or-categorize'

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

const _BulkMatchOrCategorizeParamsSchema = Schema.Struct({
  businessId: Schema.String,
})

type BulkMatchOrCategorizeParams = typeof _BulkMatchOrCategorizeParamsSchema.Type

const bulkMatchOrCategorize = post<
  Record<string, unknown>,
  BulkMatchOrCategorizeRequestEncoded,
  BulkMatchOrCategorizeParams
>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/bank-transactions/bulk-match-or-categorize`
  },
)

const useBulkMatchOrCategorizeMutation = createMutationHook({
  tags: [BULK_MATCH_OR_CATEGORIZE_TAG],
  request: bulkMatchOrCategorize,
  argToBody: (arg: BulkMatchOrCategorizeRequest) => Schema.encodeSync(BulkMatchOrCategorizeRequestSchema)(arg),
  select: ({ data }) => data,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBulkBankTransactionsTriggerSuccess,
})

export const useBulkMatchOrCategorize = () => {
  const { selectedIds } = useSelectedIds()
  const { categorizations } = useGetAllBankTransactionsCategorizations()

  const buildTransactionsPayload: () => BulkMatchOrCategorizeRequest = useCallback(() => {
    const transactions = buildBulkMatchOrCategorizePayload(selectedIds, categorizations)
    return { transactions }
  }, [selectedIds, categorizations])

  const response = useBulkMatchOrCategorizeMutation()

  return {
    response,
    buildTransactionsPayload,
  }
}
