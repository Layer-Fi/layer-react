import { Schema } from 'effect'
import useSWR from 'swr'

import { TaxPaymentsResponseSchema, type TaxReportingBasis } from '@schemas/taxEstimates'
import { getTaxPayments } from '@api/layer/taxEstimates'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

import { TAX_ESTIMATES_TAG_KEY } from './useTaxEstimates'

type UseTaxPaymentsOptions = {
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
      tags: [`${TAX_ESTIMATES_TAG_KEY}#payments`],
    } as const
  }
}

export function useTaxPayments({ year, reportingBasis, fullYearProjection }: UseTaxPaymentsOptions) {
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
      )().then(({ data }) => Schema.decodeUnknownPromise(TaxPaymentsResponseSchema)({ data }))
    },
  )
}
