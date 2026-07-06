import { type TaxDetails, TaxDetailsResponseSchema } from '@schemas/taxEstimates/details'
import { getWithQuery } from '@utils/api/getWithQuery'
import { type TaxEstimatesRequestParams, toTaxEstimatesQuery } from '@hooks/api/businesses/[business-id]/tax-estimates/taxEstimatesParams'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const TAX_DETAILS_TAG_KEY = '#tax-details'

const getTaxDetails = getWithQuery<
  typeof TaxDetailsResponseSchema.Encoded,
  TaxEstimatesRequestParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/details`,
  toTaxEstimatesQuery,
)

export const useTaxDetails = createQueryHook({
  tags: [TAX_DETAILS_TAG_KEY],
  request: getTaxDetails,
  schema: TaxDetailsResponseSchema,
})

export const useTaxDetailsGlobalCacheActions = createResourceGlobalCacheActions<TaxDetails>(TAX_DETAILS_TAG_KEY)
