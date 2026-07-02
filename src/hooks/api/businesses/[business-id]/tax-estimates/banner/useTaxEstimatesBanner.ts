import type { ReportingBasis } from '@internal-types/general'
import { type TaxEstimatesBanner, TaxEstimatesBannerResponseSchema } from '@schemas/taxEstimates/banner'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const TAX_ESTIMATES_BANNER_TAG_KEY = '#tax-estimates-banner'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type GetTaxEstimatesBannerParams = {
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}

const getTaxEstimatesBanner = getWithQuery<
  typeof TaxEstimatesBannerResponseSchema.Encoded,
  GetTaxEstimatesBannerParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/banner`,
  ({ year, reportingBasis, fullYearProjection }) => ({
    year,
    reporting_basis: reportingBasis,
    full_year_projection: fullYearProjection,
  }),
)

export const useTaxEstimatesBanner = createQueryHook({
  tags: [TAX_ESTIMATES_BANNER_TAG_KEY],
  request: getTaxEstimatesBanner,
  schema: TaxEstimatesBannerResponseSchema,
  select: ({ data }) => data,
})

export const useTaxEstimatesBannerGlobalCacheActions = createResourceGlobalCacheActions<
  TaxEstimatesBanner
>(TAX_ESTIMATES_BANNER_TAG_KEY)
