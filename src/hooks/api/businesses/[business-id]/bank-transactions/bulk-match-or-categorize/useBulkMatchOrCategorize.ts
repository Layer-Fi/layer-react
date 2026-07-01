import { useCallback } from 'react'
import { pipe, Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { type Split } from '@internal-types/bankTransactions'
import { CategoryUpdateSchema } from '@schemas/bankTransactions/categoryUpdate'
import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { type BankTransactionCategorization, BankTransactionSelectionVariant, DEFAULT_CATEGORIZATION, useGetAllBankTransactionsCategorizations } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
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

export const MatchTransactionRequestSchema = Schema.Struct({
  type: Schema.Literal('match'),
  suggestedMatchId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('suggested_match_id'),
  ),
})

export const CategorizeTransactionRequestSchema = Schema.Struct({
  type: Schema.Literal('categorize'),
  categorization: CategoryUpdateSchema,
})

export const MatchOrCategorizeTransactionRequestSchema = Schema.Union(
  MatchTransactionRequestSchema,
  CategorizeTransactionRequestSchema,
)

export const BulkMatchOrCategorizeRequestSchema = Schema.Struct({
  transactions: Schema.Record({
    key: Schema.UUID,
    value: MatchOrCategorizeTransactionRequestSchema,
  }),
})

type BulkMatchOrCategorizeRequest = typeof BulkMatchOrCategorizeRequestSchema.Type
type BulkMatchOrCategorizeRequestEncoded = typeof BulkMatchOrCategorizeRequestSchema.Encoded

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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [BULK_MATCH_OR_CATEGORIZE_TAG],
    } as const
  }
}

export const useBulkMatchOrCategorize = () => {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId, eventCallbacks } = useLayerContext()
  const { selectedIds } = useSelectedIds()
  const { categorizations } = useGetAllBankTransactionsCategorizations()

  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const buildTransactionsPayload: () => BulkMatchOrCategorizeRequest = useCallback(() => {
    const transactions = buildBulkMatchOrCategorizePayload(selectedIds, categorizations)
    return { transactions }
  }, [selectedIds, categorizations])

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg }: { arg: BulkMatchOrCategorizeRequest },
    ) => bulkMatchOrCategorize(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: Schema.encodeSync(BulkMatchOrCategorizeRequestSchema)(arg),
      },
    ).then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadBankTransactions()

      void debouncedInvalidateProfitAndLoss()

      eventCallbacks?.onTransactionCategorized?.()

      return triggerResult
    },
    [originalTrigger, forceReloadBankTransactions, debouncedInvalidateProfitAndLoss, eventCallbacks],
  )

  const proxiedResponse = withStableTrigger(mutationResponse, stableProxiedTrigger)

  return {
    ...proxiedResponse,
    buildTransactionsPayload,
  }
}
