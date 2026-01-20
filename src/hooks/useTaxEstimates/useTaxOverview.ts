import { Schema } from 'effect'
import useSWR from 'swr'

import { TaxOverviewResponseSchema, type TaxReportingBasis } from '@schemas/taxEstimates'
import { getTaxOverview } from '@api/layer/taxEstimates'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

import { TAX_ESTIMATES_TAG_KEY } from './useTaxEstimates'

type UseTaxOverviewOptions = {
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
      tags: [`${TAX_ESTIMATES_TAG_KEY}#overview`],
    } as const
  }
}

export function useTaxOverview({ year, reportingBasis, fullYearProjection }: UseTaxOverviewOptions) {
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
      )().then(({ data }) => Schema.decodeUnknownPromise(TaxOverviewResponseSchema)({ data }))
    },
  )
}
