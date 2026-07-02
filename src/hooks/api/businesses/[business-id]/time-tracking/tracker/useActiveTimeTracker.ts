import { pipe, Schema } from 'effect'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'
import { get } from '@utils/api/authenticatedHttp'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const ACTIVE_TIME_TRACKER_TAG_KEY = '#active-time-tracker'

const ActiveTimeTrackerResponseSchema = Schema.Struct({
  data: Schema.Struct({
    timeEntry: pipe(
      Schema.propertySignature(Schema.NullishOr(TimeEntrySchema)),
      Schema.fromKey('time_entry'),
    ),
  }),
})

const getActiveTimeTracker = get<
  typeof ActiveTimeTrackerResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/tracker/active`)

export const useActiveTimeTracker = createQueryHook({
  tags: [ACTIVE_TIME_TRACKER_TAG_KEY],
  request: getActiveTimeTracker,
  schema: ActiveTimeTrackerResponseSchema,
  select: ({ data }) => data.timeEntry ?? null,
})

export const useActiveTimeTrackerGlobalCacheActions = createResourceGlobalCacheActions<TimeEntry | null>(ACTIVE_TIME_TRACKER_TAG_KEY)
