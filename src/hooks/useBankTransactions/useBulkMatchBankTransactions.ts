import { Schema } from 'effect'
import { useCallback } from 'react'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { post } from '../../api/layer/authenticated_http'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { useBankTransactionsInvalidator } from './useBankTransactions'
import { usePnlDetailLinesInvalidator } from '../useProfitAndLoss/useProfitAndLossDetailLines'
import { useProfitAndLossGlobalInvalidator } from '../useProfitAndLoss/useProfitAndLossGlobalInvalidator'

const BULK_MATCH_BANK_TRANSACTIONS_TAG_KEY = '#bulk-match-bank-transactions'

// Request Schema
const SuggestedMatchWithTransactionSchema = Schema.Struct({
  transactionId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('transaction_id'),
  ),
  suggestedMatchId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('suggested_match_id'),
  ),
})

const BulkMatchRequestSchema = Schema.Struct({
  matchPairs: Schema.propertySignature(Schema.Array(SuggestedMatchWithTransactionSchema)).pipe(
    Schema.fromKey('match_pairs'),
  ),
})

type BulkMatchRequest = typeof BulkMatchRequestSchema.Type
type BulkMatchRequestEncoded = typeof BulkMatchRequestSchema.Encoded

// Response is empty object
const BulkMatchResponseSchema = Schema.Struct({})
type BulkMatchResponse = typeof BulkMatchResponseSchema.Type

// API endpoint definition
const bulkMatchBankTransactions = post<
  BulkMatchResponse,
  BulkMatchRequestEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/bulk-match`)

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
      tags: [BULK_MATCH_BANK_TRANSACTIONS_TAG_KEY],
    } as const
  }
}

type BulkMatchBankTransactionsSWRMutationResponse =
  SWRMutationResponse<BulkMatchResponse, unknown, Key, BulkMatchRequest>

class BulkMatchBankTransactionsSWRResponse {
  private swrResponse: BulkMatchBankTransactionsSWRMutationResponse

  constructor(swrResponse: BulkMatchBankTransactionsSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }

  get error() {
    return this.swrResponse.error
  }
}

export const useBulkMatchBankTransactions = () => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg }: { arg: BulkMatchRequest },
    ) => {
      const encoded = Schema.encodeSync(BulkMatchRequestSchema)(arg)
      return bulkMatchBankTransactions(
        apiUrl,
        accessToken,
        {
          params: { businessId },
          body: encoded,
        },
      ).then(Schema.decodeUnknownPromise(BulkMatchResponseSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new BulkMatchBankTransactionsSWRResponse(rawMutationResponse)

  const { debouncedInvalidateBankTransactions } = useBankTransactionsInvalidator()
  const { invalidatePnlDetailLines } = usePnlDetailLinesInvalidator()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void debouncedInvalidateBankTransactions()
      void invalidatePnlDetailLines()
      void debouncedInvalidateProfitAndLoss()

      return triggerResult
    },
    [originalTrigger, debouncedInvalidateBankTransactions, invalidatePnlDetailLines, debouncedInvalidateProfitAndLoss],
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
