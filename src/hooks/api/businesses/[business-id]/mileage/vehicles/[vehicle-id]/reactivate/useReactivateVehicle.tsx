import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { VehicleSchema } from '@schemas/vehicle'
import { post } from '@utils/api/authenticatedHttp'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const REACTIVATE_VEHICLE_TAG_KEY = '#reactivate-vehicle'

const ReactivateVehicleReturnSchema = UnwrappedDataResponseSchema(VehicleSchema)

const reactivateVehicle = post<
  typeof ReactivateVehicleReturnSchema.Encoded,
  Record<string, never>,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}/reactivate`)

export const useReactivateVehicle = createMutationHook({
  tags: [REACTIVATE_VEHICLE_TAG_KEY],
  request: reactivateVehicle,
  keyParams: ['vehicleId'],
  argToBody: (_arg: never) => undefined,
  schema: ReactivateVehicleReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchVehicleByKey } = useVehiclesGlobalCacheActions()
    return (data) => {
      void patchVehicleByKey(data)
    }
  },
})
