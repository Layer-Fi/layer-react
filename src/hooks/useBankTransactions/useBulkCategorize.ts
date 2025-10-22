import { Schema } from 'effect'
import { useCallback } from 'react'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { post } from '../../api/layer/authenticated_http'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { BulkCategorizeRequestSchema, BulkCategorizeResponseSchema, BulkCategorizeResponseDataSchema } from '../../schemas/bankTransactions/bulkCategorizeSchemas'

const BULK_CATEGORIZE_BANK_TRANSACTIONS_TAG_KEY = '#bulk-categorize-bank-transactions'

type BulkCategorizeRequest = typeof BulkCategorizeRequestSchema.Type
type BulkCategorizeRequestEncoded = typeof BulkCategorizeRequestSchema.Encoded

type BulkCategorizeResponse = typeof BulkCategorizeResponseSchema.Type

const BulkCategorize = post<
  BulkCategorizeResponse,
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

type BulkCategorizeSWRMutationResponse =
  SWRMutationResponse<typeof BulkCategorizeResponseDataSchema.Type, unknown, Key, BulkCategorizeRequest>

class BulkCategorizeSWRResponse {
  private swrResponse: BulkCategorizeSWRMutationResponse

  constructor(swrResponse: BulkCategorizeSWRMutationResponse) {
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

export const useBulkCategorize = () => {
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
      { arg }: { arg: BulkCategorizeRequest },
    ) => {
      const encoded = Schema.encodeSync(BulkCategorizeRequestSchema)(arg)
      return BulkCategorize(
        apiUrl,
        accessToken,
        {
          params: { businessId },
          body: encoded,
        },
      ).then(Schema.decodeUnknownPromise(BulkCategorizeResponseSchema)).then(
        validatedResponse => validatedResponse.data,
      )
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new BulkCategorizeSWRResponse(rawMutationResponse)

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
