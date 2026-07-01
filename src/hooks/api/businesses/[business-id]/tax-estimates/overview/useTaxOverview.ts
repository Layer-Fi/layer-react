import { Schema } from 'effect'
import useSWR from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxOverviewApiResponse, TaxOverviewApiResponseSchema } from '@schemas/taxEstimates/overview'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

const getTaxOverview = get<TaxOverviewApiResponse, GetTaxOverviewParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({
      year,
      reporting_basis: reportingBasis,
      full_year_projection: fullYearProjection,
    })
    return `/v1/businesses/${businessId}/tax-estimates/overview?${parameters}`
  },
)

const buildKey = createBuildKey<{
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}>([TAX_OVERVIEW_TAG_KEY])

export function useTaxOverview({ year, reportingBasis, fullYearProjection, enabled = true }: UseTaxOverviewOptions) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const swrResponse = useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      year,
      reportingBasis,
      fullYearProjection,
      isEnabled: enabled,
    })),
    async ({ accessToken, apiUrl, businessId, year, reportingBasis, fullYearProjection }) => {
      return getTaxOverview(
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
        .then(Schema.decodeUnknownPromise(TaxOverviewApiResponseSchema))
        .then(({ data }) => data)
    },
  )

  return new SWRQueryResult(swrResponse)
}
