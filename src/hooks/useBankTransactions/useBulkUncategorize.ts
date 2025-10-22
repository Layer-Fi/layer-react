import { Schema } from 'effect'
import { useCallback } from 'react'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { post } from '../../api/layer/authenticated_http'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'

const BULK_UNCATEGORIZE_BANK_TRANSACTIONS_TAG_KEY = '#bulk-uncategorize-bank-transactions'

const BulkUncategorizeRequestSchema = Schema.Struct({
  transactionIds: Schema.propertySignature(Schema.Array(Schema.UUID)).pipe(
    Schema.fromKey('transaction_ids'),
  ),
})

type BulkUncategorizeRequest = typeof BulkUncategorizeRequestSchema.Type
type BulkUncategorizeRequestEncoded = typeof BulkUncategorizeRequestSchema.Encoded

const UncategorizeResultSchema = Schema.Struct({
  transactionId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('transaction_id'),
  ),
  success: Schema.Boolean,
})

const BulkUncategorizeResponseDataSchema = Schema.Struct({
  results: Schema.Array(UncategorizeResultSchema),
})

const BulkUncategorizeResponseSchema = Schema.Struct({
  data: BulkUncategorizeResponseDataSchema,
})

type BulkUncategorizeResponse = typeof BulkUncategorizeResponseSchema.Type

const BulkUncategorize = post<
  BulkUncategorizeResponse,
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

type BulkUncategorizeSWRMutationResponse =
  SWRMutationResponse<typeof BulkUncategorizeResponseDataSchema.Type, unknown, Key, BulkUncategorizeRequest>

class BulkUncategorizeSWRResponse {
  private swrResponse: BulkUncategorizeSWRMutationResponse

  constructor(swrResponse: BulkUncategorizeSWRMutationResponse) {
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

export const useBulkUncategorize = () => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  // const { mutate } = useSWRConfig()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg }: { arg: BulkUncategorizeRequest },
    ) => {
      const encoded = Schema.encodeSync(BulkUncategorizeRequestSchema)(arg)
      return BulkUncategorize(
        apiUrl,
        accessToken,
        {
          params: { businessId },
          body: encoded,
        },
      ).then(Schema.decodeUnknownPromise(BulkUncategorizeResponseSchema)).then(
        validatedResponse => validatedResponse.data,
      )
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new BulkUncategorizeSWRResponse(rawMutationResponse)

  // const { debouncedInvalidateBankTransactions } = useBankTransactionsInvalidator()
  // const { invalidatePnlDetailLines } = usePnlDetailLinesInvalidator()
  // const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      // void mutate(key => withSWRKeyTags(
      //   key,
      //   tags => tags.includes(BANK_ACCOUNTS_TAG_KEY)
      //     || tags.includes(EXTERNAL_ACCOUNTS_TAG_KEY),
      // ))
      // void debouncedInvalidateBankTransactions()
      // void invalidatePnlDetailLines()
      // void debouncedInvalidateProfitAndLoss()

      return triggerResult
    },
    // [originalTrigger, mutate, debouncedInvalidateBankTransactions, invalidatePnlDetailLines, debouncedInvalidateProfitAndLoss],
    [originalTrigger],
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
