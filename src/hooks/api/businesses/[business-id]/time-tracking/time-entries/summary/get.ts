import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type TimeEntrySummary, TimeEntrySummarySchema } from '@schemas/timeTracking/timeEntrySummary'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

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

export const useGetTimeTrackingSummary = createQueryHook({
  tags: [TIME_TRACKING_SUMMARY_TAG_KEY],
  request: getTimeTrackingSummary,
  schema: TimeTrackingSummaryResponseSchema,
})

export const useTimeTrackingSummaryGlobalCacheActions = createResourceGlobalCacheActions<
  TimeEntrySummary
>(TIME_TRACKING_SUMMARY_TAG_KEY)
