import { useCallback } from 'react'
import { Schema } from 'effect'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import { type ApiTaxProfile, type TaxProfileInput, TaxProfileResponseSchema } from '@schemas/taxEstimates'
import { post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const createTaxProfile = post<
  { data: ApiTaxProfile },
  TaxProfileInput,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

import { TAX_ESTIMATES_TAG_KEY, useTaxEstimatesGlobalCacheActions } from './useTaxEstimates'

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
      tags: [`${TAX_ESTIMATES_TAG_KEY}#create-tax-profile`],
    } as const
  }
}

type CreateTaxProfileReturn = typeof TaxProfileResponseSchema.Type

type CreateTaxProfileSWRMutationResponse =
  SWRMutationResponse<CreateTaxProfileReturn, unknown, Key, TaxProfileInput>

class CreateTaxProfileSWRResponse {
  private swrResponse: CreateTaxProfileSWRMutationResponse

  constructor(swrResponse: CreateTaxProfileSWRMutationResponse) {
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

  get error() {
    return this.swrResponse.error
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

export function useCreateTaxProfile() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { invalidateTaxEstimates } = useTaxEstimatesGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...auth,
      businessId,
    }),
    async ({ accessToken, apiUrl, businessId }, { arg }: { arg: TaxProfileInput }) => {
      return createTaxProfile(
        apiUrl,
        accessToken,
        {
          params: { businessId },
          body: arg,
        },
      ).then(({ data }) => Schema.decodeUnknownPromise(TaxProfileResponseSchema)({ data }))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new CreateTaxProfileSWRResponse(rawMutationResponse)

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      await invalidateTaxEstimates()

      return triggerResult
    },
    [originalTrigger, invalidateTaxEstimates],
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
