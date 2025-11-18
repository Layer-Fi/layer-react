import useSWR from 'swr'
import { Schema } from 'effect'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { getTaxChecklist } from '@api/layer/taxEstimates'
import { TAX_ESTIMATES_TAG_KEY } from './useTaxEstimates'
import { TaxChecklistResponseSchema } from '@schemas/taxEstimates'

type UseTaxChecklistOptions = {
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
      method: 'tax-checklist',
      accessToken,
      apiUrl,
      businessId,
      year,
      tags: [TAX_ESTIMATES_TAG_KEY],
    } as const
  }
}

export function useTaxChecklist({ year, useMockData = false }: UseTaxChecklistOptions = {}) {
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
        return Schema.decodeUnknownSync(TaxChecklistResponseSchema)({
          data: {
            items: [
              {
                id: 'categorize-deductions',
                description: 'Categorize $2,100.00 of potential deductions',
                amount: 2100.00,
                status: 'pending',
                action_url: '/bank-transactions?filter=uncategorized',
              },
              {
                id: 'track-mileage',
                description: 'Track mileage for business trips',
                amount: 0,
                status: 'pending',
                action_url: '/mileage',
              },
              {
                id: 'review-quarterly-taxes',
                description: 'Review quarterly tax payments',
                amount: 945.52,
                status: 'completed',
              },
            ],
          },
        })
      }

      return getTaxChecklist(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            year,
          },
        },
      )().then(Schema.decodeUnknownPromise(TaxChecklistResponseSchema))
    },
  )
}
