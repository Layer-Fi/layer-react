import { useCallback } from 'react'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { post, patch } from '@api/layer/authenticated_http'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useAuth } from '@hooks/useAuth'
import { TripSchema, type UpsertTripEncoded } from '@schemas/trip'
import { Schema, Effect } from 'effect'
import { useTripsGlobalCacheActions } from '@features/trips/api/useListTrips'

const UPSERT_TRIP_TAG_KEY = '#upsert-trip'

export enum UpsertTripMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertTripBody = UpsertTripEncoded

const createTrip = post<
  UpsertTripReturn,
  UpsertTripBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/mileage/trips`)

const updateTrip = patch<
  UpsertTripReturn,
  UpsertTripBody,
  { businessId: string, tripId: string }
>(({ businessId, tripId }) => `/v1/businesses/${businessId}/mileage/trips/${tripId}`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  tripId = undefined,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  tripId?: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tripId,
      tags: [UPSERT_TRIP_TAG_KEY],
    } as const
  }
}

const UpsertTripReturnSchema = Schema.Struct({
  data: TripSchema,
})

type UpsertTripReturn = typeof UpsertTripReturnSchema.Type

type UpsertTripSWRMutationResponse =
    SWRMutationResponse<UpsertTripReturn, unknown, Key, UpsertTripBody>

class UpsertTripSWRResponse {
  private swrResponse: UpsertTripSWRMutationResponse

  constructor(swrResponse: UpsertTripSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

const CreateParamsSchema = Schema.Struct({
  businessId: Schema.String,
})

const UpdateParamsSchema = Schema.Struct({
  businessId: Schema.String,
  tripId: Schema.String,
})

export type CreateParams = typeof CreateParamsSchema.Type
export type UpdateParams = typeof UpdateParamsSchema.Type

export type UpsertParams = CreateParams | UpdateParams

type RequestArgs = {
  apiUrl: string
  accessToken: string
  body: UpsertTripBody
}

type UpsertRequestFn = (args: RequestArgs) => Promise<UpsertTripReturn>

const isParamsValidForMode = <M extends UpsertTripMode>(
  mode: M,
  params: unknown,
): params is M extends UpsertTripMode.Update ? UpdateParams : CreateParams => {
  if (mode === UpsertTripMode.Update) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(UpdateParamsSchema)(params)))._tag === 'Right'
  }

  if (mode === UpsertTripMode.Create) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(CreateParamsSchema)(params)))._tag === 'Right'
  }

  return false
}

function getRequestFn(
  mode: UpsertTripMode,
  params: UpsertParams,
): UpsertRequestFn {
  if (mode === UpsertTripMode.Update) {
    if (!isParamsValidForMode(UpsertTripMode.Update, params)) {
      throw new Error('Invalid params for update mode')
    }

    return ({ apiUrl, accessToken, body }: { apiUrl: string, accessToken: string, body: UpsertTripBody }) =>
      updateTrip(apiUrl, accessToken, { params, body })
  }
  else {
    if (!isParamsValidForMode(UpsertTripMode.Create, params)) {
      throw new Error('Invalid params for create mode')
    }

    return ({ apiUrl, accessToken, body }: { apiUrl: string, accessToken: string, body: UpsertTripBody }) =>
      createTrip(apiUrl, accessToken, { params, body })
  }
}

type UseUpsertTripProps =
  | { mode: UpsertTripMode.Create }
  | { mode: UpsertTripMode.Update, tripId: string }

export const useUpsertTrip = (props: UseUpsertTripProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { mode } = props
  const tripId = mode === UpsertTripMode.Update ? props.tripId : undefined

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      tripId,
    }),
    (
      { accessToken, apiUrl, businessId, tripId },
      { arg: body }: { arg: UpsertTripBody },
    ) => {
      const request = getRequestFn(mode, { businessId, tripId })

      return request({
        apiUrl,
        accessToken,
        body,
      }).then(Schema.decodeUnknownPromise(UpsertTripReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new UpsertTripSWRResponse(rawMutationResponse)

  const { patchTripByKey, forceReloadTrips } = useTripsGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      if (mode === UpsertTripMode.Update) {
        void patchTripByKey(triggerResult.data)
      }
      else {
        void forceReloadTrips()
      }

      return triggerResult
    },
    [originalTrigger, mode, patchTripByKey, forceReloadTrips],
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
