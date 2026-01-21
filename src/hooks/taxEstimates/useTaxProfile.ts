import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'

import { type TaxProfile, type TaxProfileResponse, TaxProfileResponseSchema } from '@schemas/taxEstimates/profile'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const TAX_PROFILE_TAG_KEY = '#tax-profile'

export const getTaxProfile = get<TaxProfileResponse, { businessId: string }>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/tax-estimates/profile`
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
      tags: [TAX_PROFILE_TAG_KEY],
    } as const
  }
}

class TaxProfileSWRResponse {
  private swrResponse: SWRResponse<TaxProfile>

  constructor(swrResponse: SWRResponse<TaxProfile>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

export function useTaxProfile() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => buildKey({ ...auth, businessId }),
    async ({ accessToken, apiUrl, businessId }) => {
      return getTaxProfile(
        apiUrl,
        accessToken,
        { params: { businessId } },
      )()
        .then(Schema.decodeUnknownPromise(TaxProfileResponseSchema))
        .then(({ data }) => data)
    },
  )

  return new TaxProfileSWRResponse(swrResponse)
}

export function useTaxProfileGlobalCacheActions() {
  const { patchCache } = useGlobalCacheActions()

  const patchTaxProfile = useCallback(
    (updatedProfile: TaxProfile) =>
      patchCache<TaxProfile>(
        ({ tags }) => tags.includes(TAX_PROFILE_TAG_KEY),
        () => updatedProfile,
      ),
    [patchCache],
  )

  return { patchTaxProfile }
}
