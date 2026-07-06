import { type TaxSummary, TaxSummaryResponseSchema } from '@schemas/taxEstimates/summary'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type TaxEstimatesRequestParams, toTaxEstimatesQuery } from '@hooks/api/businesses/[business-id]/tax-estimates/taxEstimatesParams'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const TAX_SUMMARY_TAG_KEY = '#tax-summary'

const getTaxSummary = getWithQuery<
  typeof TaxSummaryResponseSchema.Encoded,
  TaxEstimatesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/summary`,
  toTaxEstimatesQuery,
)

export const useTaxSummary = createQueryHook({
  tags: [TAX_SUMMARY_TAG_KEY],
  request: getTaxSummary,
  schema: TaxSummaryResponseSchema,
})

export const useTaxSummaryGlobalCacheActions = createResourceGlobalCacheActions<
  TaxSummary
>(TAX_SUMMARY_TAG_KEY)
