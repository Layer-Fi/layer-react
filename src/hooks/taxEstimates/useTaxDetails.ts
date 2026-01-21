import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxDetails, type TaxDetailsResponse, TaxDetailsResponseSchema } from '@schemas/taxEstimates/details'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAX_DETAILS_TAG_KEY = '#tax-details'
type TaxReportingBasis = Exclude<ReportingBasis, 'CASH_COLLECTED'>

type UseTaxDetailsOptions = {
  year: number
  reportingBasis?: ReportingBasis
  fullYearProjection?: boolean
}

type GetTaxDetailsParams = UseTaxDetailsOptions & {
  businessId: string
}

const getTaxDetails = get<TaxDetailsResponse, GetTaxDetailsParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({ year, reporting_basis: reportingBasis, full_year_projection: fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/details?${parameters}`
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
      tags: [TAX_DETAILS_TAG_KEY],
    } as const
  }
}

class TaxDetailsSWRResponse {
  private swrResponse: SWRResponse<TaxDetails>

  constructor(swrResponse: SWRResponse<TaxDetails>) {
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

export function useTaxDetails({ year, reportingBasis, fullYearProjection }: UseTaxDetailsOptions) {
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
      return getTaxDetails(
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
        .then(Schema.decodeUnknownPromise(TaxDetailsResponseSchema))
        .then(({ data }) => data)
    },
  )

  return new TaxDetailsSWRResponse(swrResponse)
}

export function useTaxDetailsGlobalCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadTaxDetails = useCallback(
    () => forceReload(({ tags }) => tags.includes(TAX_DETAILS_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadTaxDetails }
}
