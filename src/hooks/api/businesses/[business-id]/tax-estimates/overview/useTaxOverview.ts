import { Schema } from 'effect'
import useSWR from 'swr'

import type { ReportingBasis } from '@internal-types/general'
import { type TaxOverviewApiResponse, TaxOverviewApiResponseSchema } from '@schemas/taxEstimates/overview'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAX_OVERVIEW_TAG_KEY = '#tax-overview'

type UseTaxOverviewOptions = {
  year: number
  reportingBasis?: ReportingBasis
  fullYearProjection?: boolean
}

type GetTaxOverviewParams = UseTaxOverviewOptions & {
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
  reportingBasis?: ReportingBasis
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
      tags: [TAX_OVERVIEW_TAG_KEY],
    } as const
  }
}

export function useTaxOverview({ year, reportingBasis, fullYearProjection }: UseTaxOverviewOptions) {
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
