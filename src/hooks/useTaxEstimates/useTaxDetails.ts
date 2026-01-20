import { Schema } from 'effect'
import useSWR from 'swr'

import { type ApiTaxDetails, TaxDetailsResponseSchema, type TaxReportingBasis } from '@schemas/taxEstimates'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

import { TAX_ESTIMATES_TAG_KEY } from './useTaxEstimates'

const getTaxDetails = get<
  { data: ApiTaxDetails },
  { businessId: string, year: number, reportingBasis?: TaxReportingBasis, fullYearProjection?: boolean }
>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({ year, reportingBasis, fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/details?${parameters}`
  },
)

type UseTaxDetailsOptions = {
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}

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
      tags: [`${TAX_ESTIMATES_TAG_KEY}#details`],
    } as const
  }
}

export function useTaxDetails({ year, reportingBasis, fullYearProjection }: UseTaxDetailsOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
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
      )().then(({ data }) => Schema.decodeUnknownPromise(TaxDetailsResponseSchema)({ data }))
    },
  )
}
