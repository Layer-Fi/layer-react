import { Schema } from 'effect'
import useSWR from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxSummary, type TaxSummaryResponse, TaxSummaryResponseSchema } from '@schemas/taxEstimates/summary'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const TAX_SUMMARY_TAG_KEY = '#tax-summary'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type UseTaxSummaryOptions = {
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
  enabled?: boolean
}

type GetTaxSummaryParams = Omit<UseTaxSummaryOptions, 'enabled'> & {
  businessId: string
}

const getTaxSummary = get<TaxSummaryResponse, GetTaxSummaryParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({ year, reporting_basis: reportingBasis, full_year_projection: fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/summary?${parameters}`
  },
)

const buildKey = createBuildKey<{
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}>([TAX_SUMMARY_TAG_KEY])

export function useTaxSummary({ year, reportingBasis, fullYearProjection, enabled = true }: UseTaxSummaryOptions) {
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
      return getTaxSummary(
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
        .then(Schema.decodeUnknownPromise(TaxSummaryResponseSchema))
        .then(({ data }) => data)
    },
  )

  return new SWRQueryResult(swrResponse)
}

export const useTaxSummaryGlobalCacheActions = createResourceGlobalCacheActions<
  TaxSummary
>(TAX_SUMMARY_TAG_KEY)
