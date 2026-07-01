import { pipe, Schema } from 'effect'
import useSWR from 'swr'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
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

const buildKey = createBuildKey<{ businessId: string }>([ACTIVE_TIME_TRACKER_TAG_KEY])

export function useActiveTimeTracker(): SWRQueryResult<TimeEntry | null> {
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

  return new SWRQueryResult(response)
}

export const useActiveTimeTrackerGlobalCacheActions = createResourceGlobalCacheActions<TimeEntry | null>(ACTIVE_TIME_TRACKER_TAG_KEY)
