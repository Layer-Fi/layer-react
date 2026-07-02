import { Schema } from 'effect'

import type { ReportingBasis } from '@internal-types/general'
import { TaxOverviewApiResponseSchema } from '@schemas/taxEstimates/overview'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const TAX_OVERVIEW_TAG_KEY = '#tax-overview'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type GetTaxOverviewParams = {
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}

const getTaxOverview = getWithQuery<
  typeof TaxOverviewApiResponseSchema.Encoded,
  GetTaxOverviewParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/overview`,
  ({ year, reportingBasis, fullYearProjection }) => ({
    year,
    reporting_basis: reportingBasis,
    full_year_projection: fullYearProjection,
  }),
)

export const useTaxOverview = createQueryHook({
  tags: [TAX_OVERVIEW_TAG_KEY],
  request: getTaxOverview,
  schema: TaxOverviewApiResponseSchema.pipe(Schema.pluck('data')),
})
