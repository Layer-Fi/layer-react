import { useCallback } from 'react'

import { type StartTrackerEncoded, TimeEntrySchema } from '@schemas/timeTracking'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useActiveTimeTrackerGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const START_TIME_TRACKER_TAG_KEY = '#start-time-tracker'

type StartTimeTrackerBody = StartTrackerEncoded

const StartTimeTrackerResponseSchema = UnwrappedDataResponseSchema(TimeEntrySchema)

const startTimeTracker = post<
  typeof StartTimeTrackerResponseSchema.Encoded,
  StartTimeTrackerBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/tracker/start`)

const useStartTimeTrackerMutation = createMutationHook({
  tags: [START_TIME_TRACKER_TAG_KEY],
  request: startTimeTracker,
  schema: StartTimeTrackerResponseSchema,
  swrOptions: { throwOnError: true },
})

export const useStartTimeTracker = () => {
  const { invalidate: invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()

  const mutationResponse = useStartTimeTrackerMutation()
  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)
      void invalidateActiveTimeTracker()
      return triggerResult
    },
    [originalTrigger, invalidateActiveTimeTracker],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
