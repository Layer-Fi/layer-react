import { Schema } from 'effect'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxDetails, TaxDetailsResponseSchema } from '@schemas/taxEstimates/details'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const TAX_DETAILS_TAG_KEY = '#tax-details'

type GetTaxDetailsParams = {
  businessId: string
  year: number
  reportingBasis?: ReportingBasis
  fullYearProjection?: boolean
}

const getTaxDetails = getWithQuery<
  typeof TaxDetailsResponseSchema.Encoded,
  GetTaxDetailsParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/details`,
  ({ year, reportingBasis, fullYearProjection }) => ({
    year,
    reporting_basis: reportingBasis,
    full_year_projection: fullYearProjection,
  }),
)

export const useTaxDetails = createQueryHook({
  tags: [TAX_DETAILS_TAG_KEY],
  request: getTaxDetails,
  schema: TaxDetailsResponseSchema.pipe(Schema.pluck('data')),
})

export const useTaxDetailsGlobalCacheActions = createResourceGlobalCacheActions<TaxDetails>(TAX_DETAILS_TAG_KEY)
