import { useCallback } from 'react'
import { Schema } from 'effect'

import { type UpsertVehicleEncoded, VehicleSchema } from '@schemas/vehicle'
import { patch, post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useTripsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/trips/useListTrips'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_VEHICLE_TAG_KEY = '#upsert-vehicle'

export enum UpsertVehicleMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertVehicleBody = UpsertVehicleEncoded

const UpsertVehicleReturnSchema = Schema.Struct({
  data: VehicleSchema,
})

type UpsertVehicleReturnEncoded = typeof UpsertVehicleReturnSchema.Encoded

const createVehicle = post<UpsertVehicleReturnEncoded, UpsertVehicleBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/mileage/vehicles`,
)

const updateVehicle = patch<UpsertVehicleReturnEncoded, UpsertVehicleBody>(
  ({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}`,
)

type UpsertVehicleParams = { businessId: string, vehicleId?: string }

const upsertVehicle = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: UpsertVehicleParams, body?: UpsertVehicleBody },
): Promise<UpsertVehicleReturnEncoded> => {
  const { params, body } = options ?? {}

  if (params?.vehicleId !== undefined) {
    return updateVehicle(baseUrl, accessToken, {
      params: { businessId: params.businessId, vehicleId: params.vehicleId },
      body,
    })
  }

  return createVehicle(baseUrl, accessToken, {
    params: { businessId: params?.businessId },
    body,
  })
}

const useUpsertVehicleMutation = createMutationHook({
  tags: [UPSERT_VEHICLE_TAG_KEY],
  request: upsertVehicle,
  keyParams: ['vehicleId'],
  schema: UpsertVehicleReturnSchema,
  swrOptions: { throwOnError: true },
})

type UseUpsertVehicleProps =
  | { mode: UpsertVehicleMode.Create }
  | { mode: UpsertVehicleMode.Update, vehicleId: string }

export const useUpsertVehicle = (props: UseUpsertVehicleProps) => {
  const { mode } = props
  const vehicleId = mode === UpsertVehicleMode.Update ? props.vehicleId : undefined

  const mutationResponse = useUpsertVehicleMutation({ vehicleId })

  const { patchByKey: patchVehicleByKey, forceReload: forceReloadVehicles } = useVehiclesGlobalCacheActions()
  const { forceReload: forceReloadTrips } = useTripsGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      if (mode === UpsertVehicleMode.Update) {
        void patchVehicleByKey(triggerResult.data)
        void forceReloadTrips()
      }
      else {
        void forceReloadVehicles()
      }

      return triggerResult
    },
    [originalTrigger, mode, patchVehicleByKey, forceReloadTrips, forceReloadVehicles],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
