import { type TaxSummary, TaxSummaryResponseSchema } from '@schemas/features/taxEstimates/summary'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'
import { type TaxEstimatesRequestParams, toTaxEstimatesQuery } from '@api/businesses/[business-id]/tax-estimates/taxEstimatesParams'

const TAX_SUMMARY_TAG_KEY = '#tax-summary'

const getTaxSummary = getWithQuery<
  typeof TaxSummaryResponseSchema.Encoded,
  TaxEstimatesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/summary`,
  toTaxEstimatesQuery,
)

export const useGetTaxSummary = createQueryHook({
  tags: [TAX_SUMMARY_TAG_KEY],
  request: getTaxSummary,
  schema: TaxSummaryResponseSchema,
})

export const useTaxSummaryGlobalCacheActions = createResourceGlobalCacheActions<
  TaxSummary
>(TAX_SUMMARY_TAG_KEY)
