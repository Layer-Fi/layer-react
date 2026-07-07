import { useCallback } from 'react'
import { Schema } from 'effect'

import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const BULK_UNCATEGORIZE_BANK_TRANSACTIONS_TAG_KEY = '#bulk-uncategorize-bank-transactions'

export const BulkUncategorizeRequestSchema = Schema.Struct({
  transactionIds: Schema.propertySignature(Schema.Array(Schema.UUID)).pipe(
    Schema.fromKey('transaction_ids'),
  ),
})

type BulkUncategorizeRequest = typeof BulkUncategorizeRequestSchema.Type
type BulkUncategorizeRequestEncoded = typeof BulkUncategorizeRequestSchema.Encoded

const bulkUncategorize = post<
  { data: unknown },
  BulkUncategorizeRequestEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/bulk-uncategorize`)

const useBulkUncategorizeMutation = createMutationHook({
  tags: [BULK_UNCATEGORIZE_BANK_TRANSACTIONS_TAG_KEY],
  request: bulkUncategorize,
  argToBody: (arg: BulkUncategorizeRequest) => Schema.encodeSync(BulkUncategorizeRequestSchema)(arg),
  select: ({ data }) => data,
  swrOptions: { throwOnError: true },
})

export const useBulkUncategorize = () => {
  const { eventCallbacks } = useLayerContext()

  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const mutationResponse = useBulkUncategorizeMutation()

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
