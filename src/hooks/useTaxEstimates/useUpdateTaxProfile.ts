import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { TaxProfileResponseSchema } from '@schemas/taxEstimates'
import { type TaxProfileInput, updateTaxProfile } from '@api/layer/taxEstimates'
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
      tags: [`${TAX_ESTIMATES_TAG_KEY}#update-tax-profile`],
    } as const
  }
}

export function useUpdateTaxProfile() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { invalidateTaxEstimates } = useTaxEstimatesGlobalCacheActions()

  const swrMutationResponse = useSWRMutation(
    () => buildKey({
      ...auth,
      businessId,
    }),
    async ({ accessToken, apiUrl, businessId }, { arg }: { arg: TaxProfileInput }) => {
      const result = await updateTaxProfile(
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
