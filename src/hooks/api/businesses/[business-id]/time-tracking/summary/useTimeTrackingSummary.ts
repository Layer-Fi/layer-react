import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWR from 'swr'

import { TimeEntrySummarySchema } from '@schemas/timeTracking'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const TimeTrackingSummaryResponseSchema = Schema.Struct({
  data: TimeEntrySummarySchema,
})

export const TIME_TRACKING_SUMMARY_TAG_KEY = '#time-tracking-summary'

export type TimeTrackingSummaryFilterParams = {
  customerId?: string
  serviceId?: string
  startDate?: Date
  endDate?: Date
}

const buildKey = createBuildKey<{ businessId: string } & TimeTrackingSummaryFilterParams>([TIME_TRACKING_SUMMARY_TAG_KEY])

const getTimeTrackingSummary = get<
  typeof TimeTrackingSummaryResponseSchema.Encoded,
  { businessId: string } & TimeTrackingSummaryFilterParams
>(({ businessId, customerId, serviceId, startDate, endDate }) => {
  const parameters = toDefinedSearchParameters({
    customerId,
    serviceId,
    startDate,
    endDate,
  }).toString()
  const baseUrl = `/v1/businesses/${businessId}/time-tracking/time-entries/summary`
  return parameters ? `${baseUrl}?${parameters}` : baseUrl
})

export function useTimeTrackingSummary(filterParams: TimeTrackingSummaryFilterParams = {}) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => withLocale(buildKey({
      ...data,
      businessId,
      ...filterParams,
    })),
    ({ accessToken, apiUrl, businessId, customerId, serviceId, startDate, endDate }) => getTimeTrackingSummary(
      apiUrl,
      accessToken,
      {
        params: { businessId, customerId, serviceId, startDate, endDate },
      },
    )()
      .then(Schema.decodeUnknownPromise(TimeTrackingSummaryResponseSchema))
      .then(({ data }) => data),
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
