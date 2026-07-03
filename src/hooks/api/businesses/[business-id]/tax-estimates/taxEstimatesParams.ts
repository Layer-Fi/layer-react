import type { ReportingBasis } from '@internal-types/general'
import { type QueryParams } from '@utils/request/toDefinedSearchParameters'

export type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

export type TaxEstimatesRequestParams = {
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}

export const toTaxEstimatesQuery = (
  { year, reportingBasis, fullYearProjection }: TaxEstimatesRequestParams,
): QueryParams => ({
  year,
  reporting_basis: reportingBasis,
  full_year_projection: fullYearProjection,
})
