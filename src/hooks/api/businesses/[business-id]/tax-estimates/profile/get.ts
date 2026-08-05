import { type TaxProfile, TaxProfileResponseSchema } from '@schemas/features/taxEstimates/profile'
import { get } from '@utils/shared/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

export const TAX_PROFILE_TAG_KEY = '#tax-profile'

export const getTaxProfile = get<
  typeof TaxProfileResponseSchema.Encoded,
  { businessId: string }
>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/tax-estimates/profile`
  },
)

export const useGetTaxProfile = createQueryHook({
  tags: [TAX_PROFILE_TAG_KEY],
  request: getTaxProfile,
  schema: TaxProfileResponseSchema,
})

export const useTaxProfileGlobalCacheActions = createResourceGlobalCacheActions<TaxProfile>(TAX_PROFILE_TAG_KEY)
