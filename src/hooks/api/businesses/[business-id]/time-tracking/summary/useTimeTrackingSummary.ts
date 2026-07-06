import { type TimeEntrySummary, TimeEntrySummarySchema } from '@schemas/timeTracking'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

const TimeTrackingSummaryResponseSchema = UnwrappedDataResponseSchema(TimeEntrySummarySchema)

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
})

export const useTimeTrackingSummaryGlobalCacheActions = createResourceGlobalCacheActions<
  TimeEntrySummary
>(TIME_TRACKING_SUMMARY_TAG_KEY)
