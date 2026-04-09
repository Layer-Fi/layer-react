import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
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

const stopTimeTracker = post<
  StopTimeTrackerResponse,
  Record<string, never>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/tracker/stop`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [STOP_TIME_TRACKER_TAG_KEY],
    } as const
  }
}

export const useStopTimeTracker = () => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReloadTimeEntries } = useTimeEntriesGlobalCacheActions()
  const { invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()
  const { invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => stopTimeTracker(
      apiUrl,
      accessToken,
      {
        params: { businessId },
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
    async (...triggerParameters: Parameters<typeof originalTrigger>): ReturnType<typeof originalTrigger> => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadTimeEntries()
      void invalidateTimeTrackingSummary()
      void invalidateActiveTimeTracker()

      return triggerResult
    },
    [originalTrigger, forceReloadTimeEntries, invalidateTimeTrackingSummary, invalidateActiveTimeTracker],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      return Reflect.get(target, prop) as unknown
    },
  })
}
