import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { type StartTrackerEncoded, TimeEntrySchema } from '@schemas/timeTracking'
import { post } from '@utils/api/authenticatedHttp'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useActiveTimeTrackerGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
      tags: [START_TIME_TRACKER_TAG_KEY],
    } as const
  }
}

export const useStartTimeTracker = () => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
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
    async (...triggerParameters: Parameters<typeof originalTrigger>): ReturnType<typeof originalTrigger> => {
      const triggerResult = await originalTrigger(...triggerParameters)
      void invalidateActiveTimeTracker()
      return triggerResult
    },
    [originalTrigger, invalidateActiveTimeTracker],
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
