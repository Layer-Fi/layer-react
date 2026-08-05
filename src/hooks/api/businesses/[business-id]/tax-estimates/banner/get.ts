import { type TaxEstimatesBanner, TaxEstimatesBannerResponseSchema } from '@schemas/features/taxEstimates/banner'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'
import { type TaxEstimatesRequestParams, toTaxEstimatesQuery } from '@api/businesses/[business-id]/tax-estimates/taxEstimatesParams'

const TAX_ESTIMATES_BANNER_TAG_KEY = '#tax-estimates-banner'

const getTaxEstimatesBanner = getWithQuery<
  typeof TaxEstimatesBannerResponseSchema.Encoded,
  TaxEstimatesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/banner`,
  toTaxEstimatesQuery,
)

export const useGetTaxEstimatesBanner = createQueryHook({
  tags: [TAX_ESTIMATES_BANNER_TAG_KEY],
  request: getTaxEstimatesBanner,
  schema: TaxEstimatesBannerResponseSchema,
})

export const useTaxEstimatesBannerGlobalCacheActions = createResourceGlobalCacheActions<
  TaxEstimatesBanner
>(TAX_ESTIMATES_BANNER_TAG_KEY)
