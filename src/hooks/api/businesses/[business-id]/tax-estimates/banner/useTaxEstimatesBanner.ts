import { type TaxEstimatesBanner, TaxEstimatesBannerResponseSchema } from '@schemas/taxEstimates/banner'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type TaxEstimatesRequestParams, toTaxEstimatesQuery } from '@hooks/api/businesses/[business-id]/tax-estimates/taxEstimatesParams'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

const TAX_ESTIMATES_BANNER_TAG_KEY = '#tax-estimates-banner'

const getTaxEstimatesBanner = getWithQuery<
  typeof TaxEstimatesBannerResponseSchema.Encoded,
  TaxEstimatesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/banner`,
  toTaxEstimatesQuery,
)

export const useTaxEstimatesBanner = createQueryHook({
  tags: [TAX_ESTIMATES_BANNER_TAG_KEY],
  request: getTaxEstimatesBanner,
  schema: TaxEstimatesBannerResponseSchema,
})

export const useTaxEstimatesBannerGlobalCacheActions = createResourceGlobalCacheActions<
  TaxEstimatesBanner
>(TAX_ESTIMATES_BANNER_TAG_KEY)
