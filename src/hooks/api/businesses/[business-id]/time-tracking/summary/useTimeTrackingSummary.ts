import { Schema } from 'effect'

import { type TimeEntrySummary, TimeEntrySummarySchema } from '@schemas/timeTracking'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

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

type GetTimeTrackingSummaryParams = { businessId: string } & TimeTrackingSummaryFilterParams

const getTimeTrackingSummary = getWithQuery<
  typeof TimeTrackingSummaryResponseSchema.Encoded,
  GetTimeTrackingSummaryParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/time-tracking/time-entries/summary`,
)

export const useTimeTrackingSummary = createQueryHook({
  tags: [TIME_TRACKING_SUMMARY_TAG_KEY],
  request: getTimeTrackingSummary,
  schema: TimeTrackingSummaryResponseSchema,
  select: ({ data }) => data,
})

export const useTimeTrackingSummaryGlobalCacheActions = createResourceGlobalCacheActions<
  TimeEntrySummary
>(TIME_TRACKING_SUMMARY_TAG_KEY)
