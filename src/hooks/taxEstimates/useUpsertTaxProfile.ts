import { useCallback } from 'react'
import { Schema } from 'effect'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import { type TaxProfileRequest, type TaxProfileResponse, TaxProfileResponseSchema } from '@schemas/taxEstimates/profile'
import { patch, post } from '@api/layer/authenticated_http'
import { useTaxDetailsGlobalCacheActions } from '@hooks/taxEstimates/useTaxDetails'
import { useTaxPaymentsGlobalCacheActions } from '@hooks/taxEstimates/useTaxPayments'
import { useTaxProfileGlobalCacheActions } from '@hooks/taxEstimates/useTaxProfile'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const UPSERT_TAX_PROFILE_TAG_KEY = '#upsert-tax-profile'

export enum UpsertTaxProfileMode {
  Create = 'Create',
  Update = 'Update',
}

export const createTaxProfile = post<
  TaxProfileResponse,
  TaxProfileRequest,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

export const updateTaxProfile = patch<
  TaxProfileResponse,
  TaxProfileRequest,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

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
      tags: [UPSERT_TAX_PROFILE_TAG_KEY],
    } as const
  }
}

type UpsertTaxProfileSWRMutationResponse =
  SWRMutationResponse<TaxProfileResponse, unknown, Key, TaxProfileRequest>

class UpsertTaxProfileSWRResponse {
  private swrResponse: UpsertTaxProfileSWRMutationResponse

  constructor(swrResponse: UpsertTaxProfileSWRMutationResponse) {
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

function getRequestFn(mode: UpsertTaxProfileMode) {
  return mode === UpsertTaxProfileMode.Update ? updateTaxProfile : createTaxProfile
}

type UseUpsertTaxProfileProps = {
  mode: UpsertTaxProfileMode
}
export function useUpsertTaxProfile({ mode }: UseUpsertTaxProfileProps) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { patchTaxProfile } = useTaxProfileGlobalCacheActions()
  const { forceReloadTaxPayments } = useTaxPaymentsGlobalCacheActions()
  const { forceReloadTaxDetails } = useTaxDetailsGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...auth,
      businessId,
    }),
    async ({ accessToken, apiUrl, businessId }, { arg }: { arg: TaxProfileRequest }) => {
      const request = getRequestFn(mode)

      return request(apiUrl, accessToken, {
        params: { businessId },
        body: arg,
      }).then(Schema.decodeUnknownPromise(TaxProfileResponseSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new UpsertTaxProfileSWRResponse(rawMutationResponse)

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchTaxProfile(triggerResult.data)
      void forceReloadTaxPayments()
      void forceReloadTaxDetails()

      return triggerResult
    },
    [forceReloadTaxDetails, forceReloadTaxPayments, originalTrigger, patchTaxProfile],
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
