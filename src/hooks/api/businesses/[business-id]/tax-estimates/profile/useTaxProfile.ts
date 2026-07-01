import { Schema } from 'effect'
import useSWR from 'swr'

import { type TaxProfile, type TaxProfileResponse, TaxProfileResponseSchema } from '@schemas/taxEstimates/profile'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const TAX_PROFILE_TAG_KEY = '#tax-profile'

export const getTaxProfile = get<TaxProfileResponse, { businessId: string }>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/tax-estimates/profile`
  },
)

const buildKey = createBuildKey<{ businessId: string }>([TAX_PROFILE_TAG_KEY])

export function useTaxProfile() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWR(
    () => withLocale(buildKey({ ...auth, businessId })),
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

export const useTaxProfileGlobalCacheActions = createResourceGlobalCacheActions<TaxProfile>(TAX_PROFILE_TAG_KEY)
