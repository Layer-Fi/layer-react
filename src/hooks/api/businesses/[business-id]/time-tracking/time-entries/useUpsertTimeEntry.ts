import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { TimeEntrySchema, type UpsertTimeEntryEncoded } from '@schemas/timeTracking'
import { patch, post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useTimeTrackingSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { useTimeEntriesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { useActiveTimeTrackerGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const UPSERT_TIME_ENTRY_TAG_KEY = '#upsert-time-entry'

export enum UpsertTimeEntryMode {
  Create = 'Create',
  Update = 'Update',
}

type CreateTimeEntryBody = UpsertTimeEntryEncoded
type UpdateTimeEntryBody = Partial<UpsertTimeEntryEncoded>
type UpsertTimeEntryBody = CreateTimeEntryBody | UpdateTimeEntryBody

const createTimeEntry = post<
  UpsertTimeEntryReturn,
  CreateTimeEntryBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/time-entries`)

const updateTimeEntry = patch<
  UpsertTimeEntryReturn,
  UpdateTimeEntryBody,
  { businessId: string, timeEntryId: string }
>(({ businessId, timeEntryId }) => `/v1/businesses/${businessId}/time-tracking/time-entries/${timeEntryId}`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  timeEntryId = undefined,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  timeEntryId?: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      timeEntryId,
      tags: [UPSERT_TIME_ENTRY_TAG_KEY],
    } as const
  }
}

const UpsertTimeEntryReturnSchema = Schema.Struct({
  data: TimeEntrySchema,
})

type UpsertTimeEntryReturn = typeof UpsertTimeEntryReturnSchema.Type

type UseUpsertTimeEntryCreateProps = { mode: UpsertTimeEntryMode.Create }
type UseUpsertTimeEntryUpdateProps = { mode: UpsertTimeEntryMode.Update, timeEntryId: string }
type UseUpsertTimeEntryProps = UseUpsertTimeEntryCreateProps | UseUpsertTimeEntryUpdateProps

export function useUpsertTimeEntry(props: UseUpsertTimeEntryCreateProps): SWRMutationResult<UpsertTimeEntryReturn, CreateTimeEntryBody>
export function useUpsertTimeEntry(props: UseUpsertTimeEntryUpdateProps): SWRMutationResult<UpsertTimeEntryReturn, UpdateTimeEntryBody>
export function useUpsertTimeEntry(props: UseUpsertTimeEntryProps): SWRMutationResult<UpsertTimeEntryReturn, UpsertTimeEntryBody>
export function useUpsertTimeEntry(props: UseUpsertTimeEntryProps) {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { mode } = props
  const timeEntryId = mode === UpsertTimeEntryMode.Update ? props.timeEntryId : undefined

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
      timeEntryId,
    })),
    (
      { accessToken, apiUrl, businessId, timeEntryId },
      { arg: body }: { arg: UpsertTimeEntryBody },
    ) => {
      if (mode === UpsertTimeEntryMode.Create) {
        return createTimeEntry(apiUrl, accessToken, {
          params: { businessId },
          body: body as CreateTimeEntryBody,
        }).then(Schema.decodeUnknownPromise(UpsertTimeEntryReturnSchema))
      }

      if (timeEntryId === undefined) {
        throw new Error('timeEntryId is required for update mode')
      }

      return updateTimeEntry(apiUrl, accessToken, {
        params: { businessId, timeEntryId },
        body: body as UpdateTimeEntryBody,
      }).then(Schema.decodeUnknownPromise(UpsertTimeEntryReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const { patchTimeEntryByKey, forceReloadTimeEntries } = useTimeEntriesGlobalCacheActions()
  const { invalidateTimeTrackingSummary } = useTimeTrackingSummaryGlobalCacheActions()
  const { invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      if (mode === UpsertTimeEntryMode.Update) {
        void patchTimeEntryByKey(triggerResult.data)
        void invalidateActiveTimeTracker()
      }
      else {
        void forceReloadTimeEntries()
      }

      void invalidateTimeTrackingSummary()

      return triggerResult
    },
    [originalTrigger, mode, patchTimeEntryByKey, forceReloadTimeEntries, invalidateActiveTimeTracker, invalidateTimeTrackingSummary],
  )

  const proxiedMutationResponse = new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })

  if (mode === UpsertTimeEntryMode.Create) {
    return proxiedMutationResponse as SWRMutationResult<UpsertTimeEntryReturn, CreateTimeEntryBody>
  }

  return proxiedMutationResponse as SWRMutationResult<UpsertTimeEntryReturn, UpdateTimeEntryBody>
}
