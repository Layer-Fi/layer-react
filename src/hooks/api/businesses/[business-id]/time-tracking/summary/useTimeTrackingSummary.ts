import { useCallback } from 'react'
import { formatISO } from 'date-fns'
import { Schema } from 'effect'
import useSWR from 'swr'

import { type TimeEntrySummary, TimeEntrySummarySchema } from '@schemas/timeTracking'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const TIME_TRACKING_SUMMARY_TAG_KEY = '#time-tracking-summary'

export type TimeTrackingSummaryFilterParams = {
  customerId?: string
  serviceId?: string
  startDate?: Date
  endDate?: Date
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  customerId,
  serviceId,
  startDate,
  endDate,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
} & TimeTrackingSummaryFilterParams) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      customerId,
      serviceId,
      startDate: startDate ? formatISO(startDate, { representation: 'date' }) : undefined,
      endDate: endDate ? formatISO(endDate, { representation: 'date' }) : undefined,
      tags: [TIME_TRACKING_SUMMARY_TAG_KEY],
    } as const
  }
}

const getTimeTrackingSummary = get<
  { data: TimeEntrySummary },
  { businessId: string, customerId?: string, serviceId?: string, startDate?: string, endDate?: string }
>(({ businessId, customerId, serviceId, startDate, endDate }) => {
  const parameters = toDefinedSearchParameters({
    customerId,
    serviceId,
    startDate,
    endDate,
  })
  const baseUrl = `/v1/businesses/${businessId}/time-tracking/time-entries/summary`
  return parameters ? `${baseUrl}?${parameters}` : baseUrl
})

export function useTimeTrackingSummary(filterParams: TimeTrackingSummaryFilterParams = {}) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => buildKey({
      ...data,
      businessId,
      ...filterParams,
    }),
    ({ accessToken, apiUrl, businessId, customerId, serviceId, startDate, endDate }) => getTimeTrackingSummary(
      apiUrl,
      accessToken,
      {
        params: { businessId, customerId, serviceId, startDate, endDate },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(TimeEntrySummarySchema)(data)),
  )

  return new SWRQueryResult(response)
}

export const useTimeTrackingSummaryGlobalCacheActions = () => {
  const { invalidate } = useGlobalCacheActions()

  const invalidateTimeTrackingSummary = useCallback(
    () => invalidate(
      ({ tags }) => tags.includes(TIME_TRACKING_SUMMARY_TAG_KEY),
    ),
    [invalidate],
  )

  return { invalidateTimeTrackingSummary }
}
