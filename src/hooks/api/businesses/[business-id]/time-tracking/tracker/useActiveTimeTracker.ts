import { useCallback } from 'react'
import { pipe, Schema } from 'effect'
import useSWR from 'swr'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'
import { get } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
      tags: [ACTIVE_TIME_TRACKER_TAG_KEY],
    } as const
  }
}

export function useActiveTimeTracker() {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const response = useSWR(
    () => withLocale(buildKey({
      ...data,
      businessId,
    })),
    ({ accessToken, apiUrl, businessId }) => getActiveTimeTracker(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )()
      .then(Schema.decodeUnknownPromise(ActiveTimeTrackerResponseSchema))
      .then(({ data }) => data.timeEntry ?? null),
  )

  return new SWRQueryResult<TimeEntry | null>(response)
}

export function useActiveTimeTrackerGlobalCacheActions() {
  const { invalidate } = useGlobalCacheActions()

  const invalidateActiveTimeTracker = useCallback(
    () => invalidate(({ tags }) => tags.includes(ACTIVE_TIME_TRACKER_TAG_KEY)),
    [invalidate],
  )

  return { invalidateActiveTimeTracker }
}
