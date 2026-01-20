import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type ApiTaxEstimates, TaxEstimateResponseSchema } from '@schemas/taxEstimates'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const getTaxEstimates = get<{ data: ApiTaxEstimates }, { businessId: string, year: number }>(
  ({ businessId, year }) => {
    const parameters = toDefinedSearchParameters({ year })
    return `/v1/businesses/${businessId}/tax-estimates?${parameters}`
  },
)

export const TAX_ESTIMATES_TAG_KEY = '#tax-estimates'

type UseTaxEstimatesOptions = {
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
      tags: [`${TAX_ESTIMATES_TAG_KEY}#estimates`],
    } as const
  }
}

export function useTaxEstimates({ year }: UseTaxEstimatesOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
      year,
    }),
    async ({ accessToken, apiUrl, businessId, year }) => {
      return getTaxEstimates(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            year,
          },
        },
      )().then(({ data }) => Schema.decodeUnknownPromise(TaxEstimateResponseSchema)({ data }))
    },
  )
}

export const useTaxEstimatesGlobalCacheActions = () => {
  const { invalidate, forceReload } = useGlobalCacheActions()

  const invalidateTaxEstimates = useCallback(
    () => invalidate(({ tags }) => tags.some(tag => tag.startsWith(TAX_ESTIMATES_TAG_KEY))),
    [invalidate],
  )

  const forceReloadTaxEstimates = useCallback(
    () => forceReload(({ tags }) => tags.some(tag => tag.startsWith(TAX_ESTIMATES_TAG_KEY))),
    [forceReload],
  )

  return {
    invalidateTaxEstimates,
    forceReloadTaxEstimates,
  }
}
