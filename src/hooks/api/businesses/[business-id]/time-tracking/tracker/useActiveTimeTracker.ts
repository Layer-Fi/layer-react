import { pipe, Schema } from 'effect'
import useSWR from 'swr'

import { type TimeEntry, TimeEntrySchema } from '@schemas/timeTracking'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const response = useSWR(
    () => withLocale(buildKey({
      ...auth,
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
