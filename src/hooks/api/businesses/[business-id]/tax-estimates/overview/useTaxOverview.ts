import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type TaxOverviewResponse, TaxOverviewResponseSchema } from '@schemas/taxEstimates/overview'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TAX_OVERVIEW_TAG_KEY = '#tax-overview'

type UseTaxOverviewOptions = {
  year: number
}

type GetTaxOverviewParams = UseTaxOverviewOptions & {
  businessId: string
}

const getTaxOverview = get<TaxOverviewResponse, GetTaxOverviewParams>(
  ({ businessId, year }) => {
    const parameters = toDefinedSearchParameters({ year })
    return `/v1/businesses/${businessId}/tax-estimates/overview?${parameters}`
  },
)

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
      tags: [TAX_OVERVIEW_TAG_KEY],
    } as const
  }
}

export function useTaxOverview({ year }: UseTaxOverviewOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => buildKey({
      ...auth,
      businessId,
      year,
    }),
    async ({ accessToken, apiUrl, businessId, year }) => {
      return getTaxOverview(
        apiUrl,
        accessToken,
        { params: { businessId, year } },
      )()
        .then(Schema.decodeUnknownPromise(TaxOverviewResponseSchema))
        .then(({ data }) => data)
    },
  )

  return new SWRQueryResult(swrResponse)
}

export function useTaxOverviewGlobalCacheActions() {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadTaxOverview = useCallback(
    () => forceReload(({ tags }) => tags.includes(TAX_OVERVIEW_TAG_KEY)),
    [forceReload],
  )

  return { forceReloadTaxOverview }
}
