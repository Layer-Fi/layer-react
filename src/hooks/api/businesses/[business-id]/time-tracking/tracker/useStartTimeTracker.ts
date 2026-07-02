import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { type StartTrackerEncoded, TimeEntrySchema } from '@schemas/timeTracking'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useActiveTimeTrackerGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const START_TIME_TRACKER_TAG_KEY = '#start-time-tracker'

type StartTimeTrackerBody = StartTrackerEncoded

const StartTimeTrackerResponseSchema = Schema.Struct({
  data: TimeEntrySchema,
})

type StartTimeTrackerResponse = typeof StartTimeTrackerResponseSchema.Type

const startTimeTracker = post<
  StartTimeTrackerResponse,
  StartTimeTrackerBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/tracker/start`)

const buildKey = createBuildKey<{ businessId: string }>([START_TIME_TRACKER_TAG_KEY])

export const useStartTimeTracker = () => {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const { invalidate: invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: StartTimeTrackerBody },
    ) => startTimeTracker(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    ).then(Schema.decodeUnknownPromise(StartTimeTrackerResponseSchema)),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)
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
