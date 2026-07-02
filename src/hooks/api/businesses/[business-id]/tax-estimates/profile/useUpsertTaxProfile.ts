import { useCallback } from 'react'

import { type TaxProfileRequest, TaxProfileResponseSchema } from '@schemas/taxEstimates/profile'
import { patch, post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useTaxDetailsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tax-estimates/details/useTaxDetails'
import { useTaxPaymentsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tax-estimates/payments/useTaxPayments'
import { useTaxProfileGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_TAX_PROFILE_TAG_KEY = '#upsert-tax-profile'

export enum UpsertTaxProfileMode {
  Create = 'Create',
  Update = 'Update',
}

export const createTaxProfile = post<
  typeof TaxProfileResponseSchema.Encoded,
  TaxProfileRequest,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

export const updateTaxProfile = patch<
  typeof TaxProfileResponseSchema.Encoded,
  TaxProfileRequest,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

const useCreateTaxProfileMutation = createMutationHook({
  tags: [UPSERT_TAX_PROFILE_TAG_KEY],
  request: createTaxProfile,
  schema: TaxProfileResponseSchema,
  swrOptions: { throwOnError: true },
})

const useUpdateTaxProfileMutation = createMutationHook({
  tags: [UPSERT_TAX_PROFILE_TAG_KEY],
  request: updateTaxProfile,
  schema: TaxProfileResponseSchema,
  swrOptions: { throwOnError: true },
})

type UseUpsertTaxProfileProps = {
  mode: UpsertTaxProfileMode
}
export function useUpsertTaxProfile({ mode }: UseUpsertTaxProfileProps) {
  const { overwriteCache: overwriteTaxProfile } = useTaxProfileGlobalCacheActions()
  const { forceReload: forceReloadTaxPayments } = useTaxPaymentsGlobalCacheActions()
  const { forceReload: forceReloadTaxDetails } = useTaxDetailsGlobalCacheActions()

  const createMutationResponse = useCreateTaxProfileMutation()
  const updateMutationResponse = useUpdateTaxProfileMutation()

  const mutationResponse = mode === UpsertTaxProfileMode.Update
    ? updateMutationResponse
    : createMutationResponse

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void overwriteTaxProfile(triggerResult)
      void forceReloadTaxPayments()
      void forceReloadTaxDetails()

      return triggerResult
    },
    [forceReloadTaxDetails, forceReloadTaxPayments, originalTrigger, overwriteTaxProfile],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
