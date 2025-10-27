import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'
import { post } from '../../api/layer/authenticated_http'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { Schema } from 'effect'
import { useBankTransactionsGlobalCacheActions } from './useBankTransactions'

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
      tags: [BULK_UNCATEGORIZE_BANK_TRANSACTIONS_TAG_KEY],
    } as const
  }
}

export const useBulkUncategorize = () => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
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

      return triggerResult
    },
    [originalTrigger, forceReloadBankTransactions],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
