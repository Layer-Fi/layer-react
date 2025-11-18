import useSWRMutation from 'swr/mutation'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { createTaxProfile, type TaxProfileInput } from '@api/layer/taxEstimates'
import { useTaxEstimatesGlobalCacheActions } from './useTaxEstimates'

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
      )

      await invalidateTaxEstimates()
      return result
    },
  )

  return swrMutationResponse
}
