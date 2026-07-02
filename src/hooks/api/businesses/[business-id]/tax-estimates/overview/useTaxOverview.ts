import type { ReportingBasis } from '@internal-types/general'
import { TaxOverviewApiResponseSchema } from '@schemas/taxEstimates/overview'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const TAX_OVERVIEW_TAG_KEY = '#tax-overview'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type UseTaxOverviewOptions = {
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
  enabled?: boolean
}

type GetTaxOverviewParams = Omit<UseTaxOverviewOptions, 'enabled'> & {
  businessId: string
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

const useTaxOverviewQuery = createQueryHook({
  tags: [TAX_OVERVIEW_TAG_KEY],
  request: getTaxOverview,
  schema: TaxOverviewApiResponseSchema,
  select: ({ data }) => data,
})

export function useTaxOverview({ year, reportingBasis, fullYearProjection, enabled = true }: UseTaxOverviewOptions) {
  return useTaxOverviewQuery({
    year,
    reportingBasis,
    fullYearProjection,
    isEnabled: enabled,
  })
}
