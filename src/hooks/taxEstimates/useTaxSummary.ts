import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxSummary, type TaxSummaryResponse, TaxSummaryResponseSchema } from '@schemas/taxEstimates/summary'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAX_SUMMARY_TAG_KEY = '#tax-summary'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

// TODO: Remove mock data when backend endpoint is ready
const USE_MOCK_DATA = true

const createMockTaxSummary = (year: number): TaxSummary => ({
  type: 'Tax_Summary',
  year,
  projectedTaxesOwed: 1500000,
  taxesDueAt: new Date(`${year + 1}-04-15`),
  sections: [
    {
      label: 'Federal Income & Self-Employment Tax',
      total: 1200000,
      taxesPaid: 500000,
      taxesOwed: 700000,
    },
    {
      label: 'State Income Tax',
      total: 500000,
      taxesPaid: 200000,
      taxesOwed: 300000,
    },
  ],
})

type UseTaxSummaryOptions = {
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}

type GetTaxSummaryParams = UseTaxSummaryOptions & {
  businessId: string
}

const getTaxSummary = get<TaxSummaryResponse, GetTaxSummaryParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({ year, reporting_basis: reportingBasis, full_year_projection: fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/summary?${parameters}`
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
      tags: [TAX_SUMMARY_TAG_KEY],
    } as const
  }
}

class TaxSummarySWRResponse {
  private swrResponse: SWRResponse<TaxSummary>

  constructor(swrResponse: SWRResponse<TaxSummary>) {
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

export function useTaxSummary({ year, reportingBasis, fullYearProjection }: UseTaxSummaryOptions) {
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
    async ({ year }) => {
      // TODO: Remove mock data when backend endpoint is ready
      if (USE_MOCK_DATA) {
        return createMockTaxSummary(year)
      }

      return getTaxSummary(
        auth!.apiUrl,
        auth!.access_token,
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

  return new TaxSummarySWRResponse(swrResponse)
}

export function useTaxSummaryGlobalCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadTaxSummary = useCallback(
    () => forceReload(({ tags }) => tags.includes(TAX_SUMMARY_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadTaxSummary }
}
