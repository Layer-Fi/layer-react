import { del } from '@utils/shared/api/authenticatedHttp'
import { useVehiclesGlobalCacheActions } from '@api/businesses/[business-id]/mileage/vehicles/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const DELETE_VEHICLE_TAG_KEY = '#delete-vehicle'

const deleteVehicle = del<
  Record<string, never>,
  Record<string, never>,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}`)

export const useDeleteVehicle = createMutationHook({
  tags: [DELETE_VEHICLE_TAG_KEY],
  request: deleteVehicle,
  keyParams: ['vehicleId'],
  argToBody: (_arg: never) => undefined,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadVehicles } = useVehiclesGlobalCacheActions()

    return () => {
      void forceReloadVehicles()
    }
  },
})
