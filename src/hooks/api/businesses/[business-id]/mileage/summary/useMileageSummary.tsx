import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type MileageSummary, MileageSummarySchema } from '@schemas/mileage'
import { get } from '@utils/api/authenticatedHttp'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const MILEAGE_SUMMARY_TAG_KEY = '#mileage-summary'

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

  return new SWRQueryResult(response)
}

export const useMileageSummaryGlobalCacheActions = () => {
  const { invalidate } = useGlobalCacheActions()

  const invalidateMileageSummary = useCallback(
    () => invalidate(
      ({ tags }) => tags.includes(MILEAGE_SUMMARY_TAG_KEY),
    ),
    [invalidate],
  )

  return { invalidateMileageSummary }
}
