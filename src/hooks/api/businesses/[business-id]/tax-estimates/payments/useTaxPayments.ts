import { Schema } from 'effect'
import useSWR from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxPaymentRow, type TaxPaymentsResponse, TaxPaymentsResponseSchema } from '@schemas/taxEstimates/payments'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const TAX_PAYMENTS_TAG_KEY = '#tax-payments'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type UseTaxPaymentsOptions = {
  year: number
  reportingBasis?: ReportingBasis
  fullYearProjection?: boolean
}

type GetTaxPaymentsParams = UseTaxPaymentsOptions & {
  businessId: string
}

const getTaxPayments = get<TaxPaymentsResponse, GetTaxPaymentsParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({ year, reporting_basis: reportingBasis, full_year_projection: fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/payments?${parameters}`
  },
)

const buildKey = createBuildKey<{
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}>([TAX_PAYMENTS_TAG_KEY])

export function useTaxPayments({ year, reportingBasis, fullYearProjection }: UseTaxPaymentsOptions) {
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
      return getTaxPayments(
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
        .then(Schema.decodeUnknownPromise(TaxPaymentsResponseSchema))
        .then(({ data }) => data.data)
    },
  )

  return new SWRQueryResult(swrResponse)
}

export const useTaxPaymentsGlobalCacheActions = createResourceGlobalCacheActions<
  TaxPaymentRow[]
>(TAX_PAYMENTS_TAG_KEY)
