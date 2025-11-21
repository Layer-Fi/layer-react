import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR, { type SWRResponse } from 'swr'

import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { get } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { type MileageSummary, MileageSummarySchema } from '@features/mileage/mileageSchemas'

export const MILEAGE_SUMMARY_TAG_KEY = '#mileage-summary'

class MileageSummarySWRResponse {
  private swrResponse: SWRResponse<MileageSummary>

  constructor(swrResponse: SWRResponse<MileageSummary>) {
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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [MILEAGE_SUMMARY_TAG_KEY],
    } as const
  }
}

const getMileageSummary = get<
  { data: MileageSummary },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/mileage/summary`)

export function useMileageSummary() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => getMileageSummary(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(MileageSummarySchema)(data)),
  )

  return new MileageSummarySWRResponse(response)
}

export const useMileageSummaryCacheActions = () => {
  const { forceReload } = useGlobalCacheActions()

  const forceReloadMileageSummary = useCallback(
    () => forceReload(
      tags => tags.includes(MILEAGE_SUMMARY_TAG_KEY),
    ),
    [forceReload],
  )

  return { forceReloadMileageSummary }
}
