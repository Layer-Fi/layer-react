import { patch } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useTripsGlobalCacheActions } from '@api/businesses/[business-id]/mileage/trips/get'
import { useVehiclesGlobalCacheActions } from '@api/businesses/[business-id]/mileage/vehicles/get'
import {
  UPSERT_VEHICLE_TAG_KEY,
  type UpsertVehicleBody,
  type UpsertVehicleReturnEncoded,
  UpsertVehicleReturnSchema,
} from '@api/businesses/[business-id]/mileage/vehicles/post'

const updateVehicle = patch<
  UpsertVehicleReturnEncoded,
  UpsertVehicleBody,
  { businessId: string, vehicleId: string }
>(
  ({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}`,
)

export const usePatchVehicle = createMutationHook({
  tags: [UPSERT_VEHICLE_TAG_KEY],
  request: updateVehicle,
  keyParams: ['vehicleId'],
  schema: UpsertVehicleReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchVehicleByKey } = useVehiclesGlobalCacheActions()
    const { forceReload: forceReloadTrips } = useTripsGlobalCacheActions()

    return (data) => {
      void patchVehicleByKey(data)
      void forceReloadTrips()
    }
  },
})
