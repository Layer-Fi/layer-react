import { Schema } from 'effect'

import { type StopTrackerEncoded } from '@schemas/timeTracking'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useTimeEntriesGlobalCacheActions } from '@api/businesses/[business-id]/time-tracking/time-entries/get'
import { useTimeTrackingSummaryGlobalCacheActions } from '@api/businesses/[business-id]/time-tracking/time-entries/summary/get'
import { useActiveTimeTrackerGlobalCacheActions } from '@api/businesses/[business-id]/time-tracking/tracker/active/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const STOP_TIME_TRACKER_TAG_KEY = '#stop-time-tracker'

const StopTimeTrackerResponseSchema = UnwrappedDataResponseSchema(
  Schema.Struct({
    id: Schema.UUID,
  }),
)

type StopTimeTrackerBody = StopTrackerEncoded

const stopTimeTracker = post<
  typeof StopTimeTrackerResponseSchema.Encoded,
  StopTimeTrackerBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/tracker/stop`)

export const usePostStopTimeTracker = createMutationHook({
  tags: [STOP_TIME_TRACKER_TAG_KEY],
  request: stopTimeTracker,
  schema: StopTimeTrackerResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadTimeEntries } = useTimeEntriesGlobalCacheActions()
    const { invalidate: invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()
    const { invalidate: invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()

    return () => {
      void forceReloadTimeEntries()
      void invalidateTimeTrackingSummary()
      void invalidateActiveTimeTracker()
    }
  },
})
