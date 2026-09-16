import { TaxOverviewApiResponseSchema } from '@schemas/features/taxEstimates/overview'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { type TaxEstimatesRequestParams, toTaxEstimatesQuery } from '@api/businesses/[business-id]/tax-estimates/taxEstimatesParams'

const TAX_OVERVIEW_TAG_KEY = '#tax-overview'

const getTaxOverview = getWithQuery<
  typeof TaxOverviewApiResponseSchema.Encoded,
  TaxEstimatesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/overview`,
  toTaxEstimatesQuery,
)

export const useGetTaxOverview = createQueryHook({
  tags: [TAX_OVERVIEW_TAG_KEY],
  request: getTaxOverview,
  schema: TaxOverviewApiResponseSchema,
})
