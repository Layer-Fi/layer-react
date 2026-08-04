import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { VehicleSchema } from '@schemas/mileage/vehicle'
import { post } from '@utils/shared/api/authenticatedHttp'
import { useVehiclesGlobalCacheActions } from '@api/businesses/[business-id]/mileage/vehicles/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const REACTIVATE_VEHICLE_TAG_KEY = '#reactivate-vehicle'

const ReactivateVehicleReturnSchema = UnwrappedDataResponseSchema(VehicleSchema)

const reactivateVehicle = post<
  typeof ReactivateVehicleReturnSchema.Encoded,
  Record<string, never>,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}/reactivate`)

export const usePostReactivateVehicle = createMutationHook({
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
