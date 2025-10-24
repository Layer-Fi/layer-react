import { Schema } from 'effect'
import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'
import { post } from '../../api/layer/authenticated_http'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { ClassificationSchema } from '../../schemas/categorization'
import { useBankTransactionsGlobalCacheActions } from './useBankTransactions'

const BULK_CATEGORIZE_BANK_TRANSACTIONS_TAG_KEY = '#bulk-categorize-bank-transactions'

export const CategoryCategorizationSchema = Schema.Struct({
  type: Schema.Literal('Category'),
  category: ClassificationSchema,
})

export const SplitEntrySchema = Schema.Struct({
  amount: Schema.Number,
  category: ClassificationSchema,
})

export const SplitCategorizationSchema = Schema.Struct({
  type: Schema.Literal('Split'),
  entries: Schema.Array(SplitEntrySchema),
})

const BankTransactionCategorizationSchema = Schema.Union(
  CategoryCategorizationSchema,
  SplitCategorizationSchema,
)

export const TransactionCategorizationSchema = Schema.Struct({
  transactionId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('transaction_id'),
  ),
  categorization: BankTransactionCategorizationSchema,
})

export const BulkCategorizeRequestSchema = Schema.Struct({
  transactions: Schema.Array(TransactionCategorizationSchema),
})

type BulkCategorizeRequest = typeof BulkCategorizeRequestSchema.Type
type BulkCategorizeRequestEncoded = typeof BulkCategorizeRequestSchema.Encoded

const bulkCategorize = post<
  Record<string, unknown>,
  BulkCategorizeRequestEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/bulk-categorize`)

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
      tags: [BULK_CATEGORIZE_BANK_TRANSACTIONS_TAG_KEY],
    } as const
  }
}

export const useBulkCategorize = () => {
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
      { arg }: { arg: BulkCategorizeRequest },
    ) => bulkCategorize(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body: Schema.encodeSync(BulkCategorizeRequestSchema)(arg),
      },
    ).then(({ data }) => data),
    {
      revalidate: false,
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
