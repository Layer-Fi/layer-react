import { Schema } from 'effect'
import useSWR from 'swr'

import { TaxChecklistResponseSchema } from '@schemas/taxEstimates'
import { getTaxChecklist } from '@api/layer/taxEstimates'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

import { TAX_ESTIMATES_TAG_KEY } from './useTaxEstimates'

type UseTaxChecklistOptions = {
  year: number
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
  year: number
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      year,
      tags: [`${TAX_ESTIMATES_TAG_KEY}#checklist`],
    } as const
  }
}

export function useTaxChecklist({ year }: UseTaxChecklistOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
      year,
    }),
    async ({ accessToken, apiUrl, businessId, year }) => {
      return getTaxChecklist(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            year,
          },
        },
      )().then(({ data }) => Schema.decodeUnknownPromise(TaxChecklistResponseSchema)({ data }))
    },
  )
}
