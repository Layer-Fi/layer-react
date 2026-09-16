import { type TaxProfileRequest, TaxProfileResponseSchema } from '@schemas/features/taxEstimates/profile'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useTaxDetailsGlobalCacheActions } from '@api/businesses/[business-id]/tax-estimates/details/get'
import { useTaxPaymentsGlobalCacheActions } from '@api/businesses/[business-id]/tax-estimates/payments/get'
import { useTaxProfileGlobalCacheActions } from '@api/businesses/[business-id]/tax-estimates/profile/get'

export const UPSERT_TAX_PROFILE_TAG_KEY = '#upsert-tax-profile'

export const useTaxProfileTriggerSuccess = () => {
  const { overwriteCache: overwriteTaxProfile } = useTaxProfileGlobalCacheActions()
  const { forceReload: forceReloadTaxPayments } = useTaxPaymentsGlobalCacheActions()
  const { forceReload: forceReloadTaxDetails } = useTaxDetailsGlobalCacheActions()

  return (data: typeof TaxProfileResponseSchema.Type) => {
    void overwriteTaxProfile(data)
    void forceReloadTaxPayments()
    void forceReloadTaxDetails()
  }
}

export const createTaxProfile = post<
  typeof TaxProfileResponseSchema.Encoded,
  TaxProfileRequest,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

export const usePostTaxProfile = createMutationHook({
  tags: [UPSERT_TAX_PROFILE_TAG_KEY],
  request: createTaxProfile,
  schema: TaxProfileResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useTaxProfileTriggerSuccess,
})
