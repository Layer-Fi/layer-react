import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useAuth } from '@hooks/utils/auth/useAuth'
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

const buildKey = createBuildKey<{ businessId: string }>([BULK_UNCATEGORIZE_BANK_TRANSACTIONS_TAG_KEY])

export const useBulkUncategorize = () => {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId, eventCallbacks } = useLayerContext()

  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg }: { arg: BulkUncategorizeRequest },
    ) => bulkUncategorize(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: Schema.encodeSync(BulkUncategorizeRequestSchema)(arg),
      },
    ).then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

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
