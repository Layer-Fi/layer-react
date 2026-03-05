import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type TaxProfile, type TaxProfileResponse, TaxProfileResponseSchema } from '@schemas/taxEstimates/profile'
import { get } from '@utils/authenticatedHttp'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
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

  return new SWRQueryResult(swrResponse)
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
