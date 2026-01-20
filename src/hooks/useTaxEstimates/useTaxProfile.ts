import { Schema } from 'effect'
import useSWR from 'swr'

import { type ApiTaxProfile, TaxProfileResponseSchema } from '@schemas/taxEstimates'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const getTaxProfile = get<{ data: ApiTaxProfile }, { businessId: string }>(
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`,
)

import { TAX_ESTIMATES_TAG_KEY } from './useTaxEstimates'

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
      tags: [`${TAX_ESTIMATES_TAG_KEY}#profile`],
    } as const
  }
}

export function useTaxProfile() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
    }),
    async ({ accessToken, apiUrl, businessId }) => {
      return getTaxProfile(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
          },
        },
      )().then(({ data }) => Schema.decodeUnknownPromise(TaxProfileResponseSchema)({ data }))
    },
  )
}
