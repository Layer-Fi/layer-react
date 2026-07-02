import { useCallback } from 'react'
import { Schema } from 'effect'

import { CategoryUpdateSchema } from '@schemas/bankTransactions/categoryUpdate'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const BULK_CATEGORIZE_BANK_TRANSACTIONS_TAG_KEY = '#bulk-categorize-bank-transactions'

export const CategorizeTransactionRequestSchema = Schema.Struct({
  transactionId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('transaction_id'),
  ),
  categorization: CategoryUpdateSchema,
})

export const BulkCategorizeRequestSchema = Schema.Struct({
  transactions: Schema.Array(CategorizeTransactionRequestSchema),
})

type BulkCategorizeRequest = typeof BulkCategorizeRequestSchema.Type
type BulkCategorizeRequestEncoded = typeof BulkCategorizeRequestSchema.Encoded

const bulkCategorize = post<
  Record<string, unknown>,
  BulkCategorizeRequestEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/bulk-categorize`)

const useBulkCategorizeMutation = createMutationHook({
  tags: [BULK_CATEGORIZE_BANK_TRANSACTIONS_TAG_KEY],
  request: bulkCategorize,
  argToBody: (arg: BulkCategorizeRequest) => Schema.encodeSync(BulkCategorizeRequestSchema)(arg),
  select: ({ data }) => data,
  swrOptions: { throwOnError: true },
})

export const useBulkCategorize = () => {
  const { eventCallbacks } = useLayerContext()

  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const mutationResponse = useBulkCategorizeMutation()

  const originalTrigger = mutationResponse.trigger

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

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
