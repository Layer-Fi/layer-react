import { useCallback } from 'react'
import { Effect, Schema } from 'effect'
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

const CreateParamsSchema = Schema.Struct({
  businessId: Schema.String,
  timeEntryId: Schema.Undefined,
})

const UpdateParamsSchema = Schema.Struct({
  businessId: Schema.String,
  timeEntryId: Schema.String,
})

export type CreateParams = typeof CreateParamsSchema.Type
export type UpdateParams = typeof UpdateParamsSchema.Type

export type UpsertParams = CreateParams | UpdateParams

type RequestArgs = {
  apiUrl: string
  accessToken: string
  body: UpsertTimeEntryBody
}

type UpsertRequestFn = (args: RequestArgs) => Promise<UpsertTimeEntryReturn>

const isParamsValidForMode = <M extends UpsertTimeEntryMode>(
  mode: M,
  params: unknown,
): params is M extends UpsertTimeEntryMode.Update ? UpdateParams : CreateParams => {
  if (mode === UpsertTimeEntryMode.Update) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(UpdateParamsSchema)(params)))._tag === 'Right'
  }

  if (mode === UpsertTimeEntryMode.Create) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(CreateParamsSchema)(params)))._tag === 'Right'
  }

  return false
}

function getRequestFn(
  mode: UpsertTimeEntryMode,
  params: UpsertParams,
): UpsertRequestFn {
  if (mode === UpsertTimeEntryMode.Update) {
    if (!isParamsValidForMode(UpsertTimeEntryMode.Update, params)) {
      throw new Error('Invalid params for update mode')
    }

    return ({ apiUrl, accessToken, body }: { apiUrl: string, accessToken: string, body: UpsertTimeEntryBody }) =>
      updateTimeEntry(apiUrl, accessToken, { params, body })
  }
  else {
    if (!isParamsValidForMode(UpsertTimeEntryMode.Create, params)) {
      throw new Error('Invalid params for create mode')
    }

    return ({ apiUrl, accessToken, body }: { apiUrl: string, accessToken: string, body: UpsertTimeEntryBody }) =>
      createTimeEntry(apiUrl, accessToken, { params, body })
  }
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
