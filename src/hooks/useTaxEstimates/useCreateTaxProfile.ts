import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { TaxProfileResponseSchema } from '@schemas/taxEstimates'
import { createTaxProfile, type TaxProfileInput } from '@api/layer/taxEstimates'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

export function useCreateTaxProfile() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { invalidateTaxEstimates } = useTaxEstimatesGlobalCacheActions()

  const swrMutationResponse = useSWRMutation(
    () => buildKey({
      ...auth,
      businessId,
    }),
    async ({ accessToken, apiUrl, businessId }, { arg }: { arg: TaxProfileInput }) => {
      const result = await createTaxProfile(
        apiUrl,
        accessToken,
        {
          params: { businessId },
          body: arg,
        },
      ).then(({ data }) => Schema.decodeUnknownPromise(TaxProfileResponseSchema)({ data }))

      await invalidateTaxEstimates()
      return result
    },
  )

  return swrMutationResponse
}
