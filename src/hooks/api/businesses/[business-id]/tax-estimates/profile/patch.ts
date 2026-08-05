import { type TaxProfileRequest, TaxProfileResponseSchema } from '@schemas/taxEstimates/profile'
import { patch } from '@utils/shared/api/authenticatedHttp'
import { UPSERT_TAX_PROFILE_TAG_KEY, useTaxProfileTriggerSuccess } from '@api/businesses/[business-id]/tax-estimates/profile/post'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export const updateTaxProfile = patch<
  typeof TaxProfileResponseSchema.Encoded,
  TaxProfileRequest,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

export const usePatchTaxProfile = createMutationHook({
  tags: [UPSERT_TAX_PROFILE_TAG_KEY],
  request: updateTaxProfile,
  schema: TaxProfileResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useTaxProfileTriggerSuccess,
})
