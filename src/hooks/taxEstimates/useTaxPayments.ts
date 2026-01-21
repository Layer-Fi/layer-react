import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxPayments, type TaxPaymentsResponse, TaxPaymentsResponseSchema } from '@schemas/taxEstimates/payments'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  year,
  reportingBasis,
  fullYearProjection,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      year,
      reportingBasis,
      fullYearProjection,
      tags: [TAX_PAYMENTS_TAG_KEY],
    } as const
  }
}

class TaxPaymentsSWRResponse {
  private swrResponse: SWRResponse<TaxPayments>

  constructor(swrResponse: SWRResponse<TaxPayments>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

export function useTaxPayments({ year, reportingBasis, fullYearProjection }: UseTaxPaymentsOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => buildKey({
      ...auth,
      businessId,
      year,
      reportingBasis,
      fullYearProjection,
    }),
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
        .then(({ data }) => data)
    },
  )

  return new TaxPaymentsSWRResponse(swrResponse)
}

export function useTaxPaymentsGlobalCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadTaxPayments = useCallback(
    () => forceReload(({ tags }) => tags.includes(TAX_PAYMENTS_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadTaxPayments }
}
