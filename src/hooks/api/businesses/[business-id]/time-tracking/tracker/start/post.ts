import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { TimeEntrySchema } from '@schemas/timeTracking/timeEntry'
import { type StartTrackerEncoded } from '@schemas/timeTracking/tracker'
import { post } from '@utils/api/authenticatedHttp'
import { useActiveTimeTrackerGlobalCacheActions } from '@api/businesses/[business-id]/time-tracking/tracker/active/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const START_TIME_TRACKER_TAG_KEY = '#start-time-tracker'

type StartTimeTrackerBody = StartTrackerEncoded

const StartTimeTrackerResponseSchema = UnwrappedDataResponseSchema(TimeEntrySchema)

const startTimeTracker = post<
  typeof StartTimeTrackerResponseSchema.Encoded,
  StartTimeTrackerBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/tracker/start`)

export const usePostStartTimeTracker = createMutationHook({
  tags: [START_TIME_TRACKER_TAG_KEY],
  request: startTimeTracker,
  schema: StartTimeTrackerResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()

    return () => {
      void invalidateActiveTimeTracker()
    }
  },
})
