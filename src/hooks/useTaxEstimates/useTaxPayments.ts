import useSWR from 'swr'
import { Schema } from 'effect'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { getTaxPayments } from '@api/layer/taxEstimates'
import { TAX_ESTIMATES_TAG_KEY } from './useTaxEstimates'
import { taxEstimateDefaults } from './mockData'
import { TaxPaymentsResponseSchema } from '@schemas/taxEstimates'

type UseTaxPaymentsOptions = {
  year?: number
  useMockData?: boolean
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  year,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  year?: number
}) {
  if (accessToken && apiUrl) {
    return {
      method: 'tax-payments',
      accessToken,
      apiUrl,
      businessId,
      year,
      tags: [TAX_ESTIMATES_TAG_KEY],
    } as const
  }
}

export function useTaxPayments({ year, useMockData = false }: UseTaxPaymentsOptions = {}) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
      year,
    }),
    async ({ accessToken, apiUrl, businessId, year }) => {
      if (useMockData) {
        const quarters = taxEstimateDefaults.quarterlyEstimates.map((estimate, index) => {
          const payment = taxEstimateDefaults.quarterlyPayments[index]
          const previousPayment = index > 0 ? taxEstimateDefaults.quarterlyPayments[index - 1] : null
          const previousEstimate = index > 0 ? taxEstimateDefaults.quarterlyEstimates[index - 1] : null

          const rolledOver = previousPayment && previousEstimate
            ? Math.max(0, previousEstimate.amount - previousPayment.amount)
            : 0

          return {
            quarter: estimate.quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4',
            rolled_over_from_previous_quarter: rolledOver,
            owed_this_quarter: estimate.amount,
            total_paid: payment?.amount ?? 0,
            total: estimate.amount + rolledOver - (payment?.amount ?? 0),
          }
        })

        return Schema.decodeUnknownSync(TaxPaymentsResponseSchema)({
          data: {
            quarters,
          },
        })
      }

      return getTaxPayments(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            year,
          },
        },
      )().then(Schema.decodeUnknownPromise(TaxPaymentsResponseSchema))
    },
  )
}
