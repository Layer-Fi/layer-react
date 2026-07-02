import { useCallback } from 'react'
import { Schema } from 'effect'

import { type StopTrackerEncoded } from '@schemas/timeTracking'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useTimeTrackingSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { useTimeEntriesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { useActiveTimeTrackerGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const STOP_TIME_TRACKER_TAG_KEY = '#stop-time-tracker'

const StopTimeTrackerResponseSchema = Schema.Struct({
  data: Schema.Struct({
    id: Schema.UUID,
  }),
})

type StopTimeTrackerBody = StopTrackerEncoded

const stopTimeTracker = post<
  typeof StopTimeTrackerResponseSchema.Encoded,
  StopTimeTrackerBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/tracker/stop`)

const useStopTimeTrackerMutation = createMutationHook({
  tags: [STOP_TIME_TRACKER_TAG_KEY],
  request: stopTimeTracker,
  schema: StopTimeTrackerResponseSchema,
  swrOptions: { throwOnError: true },
})

export const useStopTimeTracker = () => {
  const { forceReload: forceReloadTimeEntries } = useTimeEntriesGlobalCacheActions()
  const { invalidate: invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()
  const { invalidate: invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()

  const mutationResponse = useStopTimeTrackerMutation()
  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadTimeEntries()
      void invalidateTimeTrackingSummary()
      void invalidateActiveTimeTracker()

      return triggerResult
    },
    [originalTrigger, forceReloadTimeEntries, invalidateTimeTrackingSummary, invalidateActiveTimeTracker],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
