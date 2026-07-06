import { TaxOverviewApiResponseSchema } from '@schemas/taxEstimates/overview'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type TaxEstimatesRequestParams, toTaxEstimatesQuery } from '@hooks/api/businesses/[business-id]/tax-estimates/taxEstimatesParams'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const TAX_OVERVIEW_TAG_KEY = '#tax-overview'

const getTaxOverview = getWithQuery<
  typeof TaxOverviewApiResponseSchema.Encoded,
  TaxEstimatesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/overview`,
  toTaxEstimatesQuery,
)

export const useTaxOverview = createQueryHook({
  tags: [TAX_OVERVIEW_TAG_KEY],
  request: getTaxOverview,
  schema: TaxOverviewApiResponseSchema,
})
