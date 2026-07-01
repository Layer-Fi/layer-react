import { Schema } from 'effect'
import useSWR from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxEstimatesBanner, type TaxEstimatesBannerResponse, TaxEstimatesBannerResponseSchema } from '@schemas/taxEstimates/banner'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const TAX_ESTIMATES_BANNER_TAG_KEY = '#tax-estimates-banner'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type UseTaxEstimatesBannerOptions = {
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}

type GetTaxEstimatesBannerParams = UseTaxEstimatesBannerOptions & {
  businessId: string
}

const getTaxEstimatesBanner = get<TaxEstimatesBannerResponse, GetTaxEstimatesBannerParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({
      year,
      reporting_basis: reportingBasis,
      full_year_projection: fullYearProjection,
    })
    return `/v1/businesses/${businessId}/tax-estimates/banner?${parameters}`
  },
)

const buildKey = createBuildKey<{
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}>([TAX_ESTIMATES_BANNER_TAG_KEY])

export function useTaxEstimatesBanner({ year, reportingBasis, fullYearProjection }: UseTaxEstimatesBannerOptions) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      year,
      reportingBasis,
      fullYearProjection,
    })),
    async ({ accessToken, apiUrl, businessId, year, reportingBasis, fullYearProjection }) => {
      return getTaxEstimatesBanner(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            year,
            reportingBasis,
            fullYearProjection,
          },
        },
      )()
        .then(Schema.decodeUnknownPromise(TaxEstimatesBannerResponseSchema))
        .then(({ data }) => data)
    },
  )

  return new SWRQueryResult(swrResponse)
}

export const useTaxEstimatesBannerGlobalCacheActions = createResourceGlobalCacheActions<
  TaxEstimatesBanner
>(TAX_ESTIMATES_BANNER_TAG_KEY)
