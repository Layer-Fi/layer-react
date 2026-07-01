import { Schema } from 'effect'
import useSWR from 'swr'

import { type TimeEntrySummary, TimeEntrySummarySchema } from '@schemas/timeTracking'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
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

export const useTimeTrackingSummaryGlobalCacheActions = createResourceGlobalCacheActions<
  TimeEntrySummary
>(TIME_TRACKING_SUMMARY_TAG_KEY)
