import { useCallback } from 'react'
import type { Key } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'
import { post, patch } from '@api/layer/authenticated_http'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useAuth } from '@hooks/useAuth'
import { VehicleSchema, type UpsertVehicleEncoded } from '@schemas/vehicle'
import { Schema, Effect } from 'effect'
import { VEHICLES_TAG_KEY } from './useListVehicles'
import { useSWRConfig } from 'swr'

const UPSERT_VEHICLE_TAG_KEY = '#upsert-vehicle'

export enum UpsertVehicleMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertVehicleBody = UpsertVehicleEncoded

const createVehicle = post<
  UpsertVehicleReturn,
  UpsertVehicleBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/mileage/vehicles`)

const updateVehicle = patch<
  UpsertVehicleReturn,
  UpsertVehicleBody,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}`)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  vehicleId = undefined,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  vehicleId?: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      vehicleId,
      tags: [UPSERT_VEHICLE_TAG_KEY],
    } as const
  }
}

const UpsertVehicleReturnSchema = Schema.Struct({
  data: VehicleSchema,
})
type UpsertVehicleReturn = typeof UpsertVehicleReturnSchema.Type

type UpsertVehicleSWRMutationResponse =
  SWRMutationResponse<UpsertVehicleReturn, unknown, Key, UpsertVehicleBody>

type RequestArgs = {
  apiUrl: string
  accessToken: string
  body: UpsertVehicleBody
}

const CreateParamsSchema = Schema.Struct({
  businessId: Schema.UUID,
  vehicleId: Schema.Undefined,
})

const UpdateParamsSchema = Schema.Struct({
  businessId: Schema.UUID,
  vehicleId: Schema.UUID,
})

type CreateParams = typeof CreateParamsSchema.Type
type UpdateParams = typeof UpdateParamsSchema.Type

type UpsertParams = CreateParams | UpdateParams

type UpsertRequestFn = (args: RequestArgs) => Promise<UpsertVehicleReturn>

const isParamsValidForMode = <M extends UpsertVehicleMode>(
  mode: M,
  params: unknown,
): params is M extends UpsertVehicleMode.Update ? UpdateParams : CreateParams => {
  if (mode === UpsertVehicleMode.Update) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(UpdateParamsSchema)(params)))._tag === 'Right'
  }

  if (mode === UpsertVehicleMode.Create) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(CreateParamsSchema)(params)))._tag === 'Right'
  }

  return false
}

function getRequestFn(
  mode: UpsertVehicleMode,
  params: UpsertParams,
): UpsertRequestFn {
  if (mode === UpsertVehicleMode.Update) {
    if (!isParamsValidForMode(UpsertVehicleMode.Update, params)) {
      throw new Error('Invalid params for update mode')
    }

    return ({ apiUrl, accessToken, body }: { apiUrl: string, accessToken: string, body: UpsertVehicleBody }) =>
      updateVehicle(apiUrl, accessToken, { params, body })
  }
  else {
    if (!isParamsValidForMode(UpsertVehicleMode.Create, params)) {
      throw new Error('Invalid params for create mode')
    }

    return ({ apiUrl, accessToken, body }: { apiUrl: string, accessToken: string, body: UpsertVehicleBody }) =>
      createVehicle(apiUrl, accessToken, { params, body })
  }
}

type UseUpsertVehicleProps =
  | { mode: UpsertVehicleMode.Create }
  | { mode: UpsertVehicleMode.Update, vehicleId: string }

export const useUpsertVehicle = (props: UseUpsertVehicleProps) => {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const { mode } = props
  const vehicleId = mode === UpsertVehicleMode.Update ? props.vehicleId : undefined

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      vehicleId,
    }),
    (
      { accessToken, apiUrl, businessId, vehicleId },
      { arg: body }: { arg: UpsertVehicleBody },
    ) => {
      const request = getRequestFn(mode, { businessId, vehicleId })

      return request({
        apiUrl,
        accessToken,
        body,
      }).then(Schema.decodeUnknownPromise(UpsertVehicleReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new UpsertVehicleSWRResponse(rawMutationResponse)

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      // Revalidate the vehicles list
      void mutate((key) => {
        if (typeof key === 'object' && key !== null && 'tags' in key) {
          const tags = key.tags as string[]
          return tags.includes(VEHICLES_TAG_KEY)
        }
        return false
      })

      return triggerResult
    },
    [originalTrigger, mutate],
  )

  return {
    ...mutationResponse,
    trigger: stableProxiedTrigger,
  }
}

class UpsertVehicleSWRResponse {
  private swrResponse: UpsertVehicleSWRMutationResponse

  constructor(swrResponse: UpsertVehicleSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get data() {
    return this.swrResponse.data
  }

  get error() {
    return this.swrResponse.error
  }
}
