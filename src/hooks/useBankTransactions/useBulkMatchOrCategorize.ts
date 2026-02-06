import { useCallback } from 'react'
import { pipe, Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { CategoryUpdateSchema } from '@schemas/bankTransactions/categoryUpdate'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useBankTransactionsGlobalCacheActions } from '@hooks/useBankTransactions/useBankTransactions'
import { buildBulkMatchOrCategorizePayload } from '@hooks/useBankTransactions/utils'
import { useProfitAndLossGlobalInvalidator } from '@hooks/useProfitAndLoss/useProfitAndLossGlobalInvalidator'
import { useGetAllBankTransactionsCategories } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const BULK_MATCH_OR_CATEGORIZE_TAG = '#bulk-match-or-categorize'

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
    const parameters = toDefinedSearchParameters({
      categorization_source: 'API_FROM_COMPONENT',
    })

    return `/v1/businesses/${businessId}/bank-transactions/bulk-match-or-categorize?${parameters}`
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
  const { data } = useAuth()
  const { businessId, eventCallbacks } = useLayerContext()
  const { selectedIds } = useSelectedIds()
  const { transactionCategories } = useGetAllBankTransactionsCategories()

  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const buildTransactionsPayload: () => BulkMatchOrCategorizeRequest = useCallback(() => {
    const transactions = buildBulkMatchOrCategorizePayload(selectedIds, transactionCategories)
    return { transactions }
  }, [selectedIds, transactionCategories])

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
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

  const proxiedResponse = new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })

  return {
    ...proxiedResponse,
    buildTransactionsPayload,
  }
}
