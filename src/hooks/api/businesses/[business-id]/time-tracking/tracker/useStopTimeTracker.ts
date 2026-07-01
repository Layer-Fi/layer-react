import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { type StopTrackerEncoded } from '@schemas/timeTracking'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useTimeTrackingSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { useTimeEntriesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { useActiveTimeTrackerGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const STOP_TIME_TRACKER_TAG_KEY = '#stop-time-tracker'

const StopTimeTrackerResponseSchema = Schema.Struct({
  data: Schema.Struct({
    id: Schema.UUID,
  }),
})

type StopTimeTrackerResponse = typeof StopTimeTrackerResponseSchema.Type
type StopTimeTrackerBody = StopTrackerEncoded

const stopTimeTracker = post<
  StopTimeTrackerResponse,
  StopTimeTrackerBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/tracker/stop`)

const buildKey = createBuildKey<{ businessId: string }>([STOP_TIME_TRACKER_TAG_KEY])

export const useStopTimeTracker = () => {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReload: forceReloadTimeEntries } = useTimeEntriesGlobalCacheActions()
  const { invalidate: invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()
  const { invalidate: invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
    })),
    ({ accessToken, apiUrl, businessId }, { arg: body }: { arg: StopTimeTrackerBody }) => stopTimeTracker(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    ).then(Schema.decodeUnknownPromise(StopTimeTrackerResponseSchema)),
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

      void forceReloadTimeEntries()
      void invalidateTimeTrackingSummary()
      void invalidateActiveTimeTracker()

      return triggerResult
    },
    [originalTrigger, forceReloadTimeEntries, invalidateTimeTrackingSummary, invalidateActiveTimeTracker],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
