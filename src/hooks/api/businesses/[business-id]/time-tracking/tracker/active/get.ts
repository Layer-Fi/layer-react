import { pipe, Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type TimeEntry, TimeEntrySchema } from '@schemas/features/timeTracking/timeEntry'
import { get } from '@utils/shared/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

export const ACTIVE_TIME_TRACKER_TAG_KEY = '#active-time-tracker'

const ActiveTimeTrackerResponseSchema = UnwrappedDataResponseSchema(
  Schema.Struct({
    timeEntry: pipe(
      Schema.propertySignature(Schema.NullishOr(TimeEntrySchema)),
      Schema.fromKey('time_entry'),
    ),
  }),
)

const getActiveTimeTracker = get<
  typeof ActiveTimeTrackerResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/tracker/active`)

export const useGetActiveTimeTracker = createQueryHook({
  tags: [ACTIVE_TIME_TRACKER_TAG_KEY],
  request: getActiveTimeTracker,
  schema: ActiveTimeTrackerResponseSchema,
  select: data => data.timeEntry ?? null,
})

export const useActiveTimeTrackerGlobalCacheActions = createResourceGlobalCacheActions<TimeEntry | null>(ACTIVE_TIME_TRACKER_TAG_KEY)
