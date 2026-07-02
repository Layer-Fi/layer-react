import type { ReportingBasis } from '@internal-types/general'
import { type TaxSummary, TaxSummaryResponseSchema } from '@schemas/taxEstimates/summary'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const TAX_SUMMARY_TAG_KEY = '#tax-summary'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type GetTaxSummaryParams = {
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}

const getTaxSummary = getWithQuery<
  typeof TaxSummaryResponseSchema.Encoded,
  GetTaxSummaryParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/summary`,
  ({ year, reportingBasis, fullYearProjection }) => ({
    year,
    reporting_basis: reportingBasis,
    full_year_projection: fullYearProjection,
  }),
)

export const useTaxSummary = createQueryHook({
  tags: [TAX_SUMMARY_TAG_KEY],
  request: getTaxSummary,
  schema: TaxSummaryResponseSchema,
  select: ({ data }) => data,
})

export const useTaxSummaryGlobalCacheActions = createResourceGlobalCacheActions<
  TaxSummary
>(TAX_SUMMARY_TAG_KEY)
