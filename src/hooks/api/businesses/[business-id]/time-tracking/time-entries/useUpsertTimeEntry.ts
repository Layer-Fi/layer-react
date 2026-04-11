import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { TimeEntrySchema, type UpsertTimeEntryEncoded } from '@schemas/timeTracking'
import { patch, post } from '@utils/api/authenticatedHttp'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useTimeTrackingSummaryGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/summary/useTimeTrackingSummary'
import { useTimeEntriesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useListTimeEntries'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const UPSERT_TIME_ENTRY_TAG_KEY = '#upsert-time-entry'

export enum UpsertTimeEntryMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertTimeEntryBody = UpsertTimeEntryEncoded

const createTimeEntry = post<
  UpsertTimeEntryReturn,
  UpsertTimeEntryBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/time-tracking/time-entries`)

const updateTimeEntry = patch<
  UpsertTimeEntryReturn,
  UpsertTimeEntryBody,
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

type RequestArgs = {
  apiUrl: string
  accessToken: string
  body: UpsertTimeEntryBody
}

type UpsertRequestFn = (args: RequestArgs) => Promise<UpsertTimeEntryReturn>

function getRequestFn(
  mode: UpsertTimeEntryMode,
  params: { businessId: string, timeEntryId: string | undefined },
): UpsertRequestFn {
  if (mode === UpsertTimeEntryMode.Update) {
    if (params.timeEntryId === undefined) {
      throw new Error('timeEntryId is required for update mode')
    }

    const updateParams = { businessId: params.businessId, timeEntryId: params.timeEntryId }

    return ({ apiUrl, accessToken, body }) =>
      updateTimeEntry(apiUrl, accessToken, { params: updateParams, body })
  }

  return ({ apiUrl, accessToken, body }) =>
    createTimeEntry(apiUrl, accessToken, { params: { businessId: params.businessId }, body })
}

type UseUpsertTimeEntryProps =
  | { mode: UpsertTimeEntryMode.Create }
  | { mode: UpsertTimeEntryMode.Update, timeEntryId: string }

export const useUpsertTimeEntry = (props: UseUpsertTimeEntryProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { mode } = props
  const timeEntryId = mode === UpsertTimeEntryMode.Update ? props.timeEntryId : undefined

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      timeEntryId,
    }),
    (
      { accessToken, apiUrl, businessId, timeEntryId },
      { arg: body }: { arg: UpsertTimeEntryBody },
    ) => {
      const request = getRequestFn(mode, { businessId, timeEntryId })

      return request({
        apiUrl,
        accessToken,
        body,
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

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      if (mode === UpsertTimeEntryMode.Update) {
        void patchTimeEntryByKey(triggerResult.data)
      }
      else {
        void forceReloadTimeEntries()
      }

      void invalidateTimeTrackingSummary()

      return triggerResult
    },
    [originalTrigger, mode, patchTimeEntryByKey, forceReloadTimeEntries, invalidateTimeTrackingSummary],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
