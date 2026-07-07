import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { VehicleSchema } from '@schemas/vehicle'
import { post } from '@utils/api/authenticatedHttp'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const ARCHIVE_VEHICLE_TAG_KEY = '#archive-vehicle'

const ArchiveVehicleReturnSchema = UnwrappedDataResponseSchema(VehicleSchema)

const archiveVehicle = post<
  typeof ArchiveVehicleReturnSchema.Encoded,
  Record<string, never>,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}/archive`)

export const useArchiveVehicle = createMutationHook({
  tags: [ARCHIVE_VEHICLE_TAG_KEY],
  request: archiveVehicle,
  keyParams: ['vehicleId'],
  argToBody: (_arg: never) => undefined,
  schema: ArchiveVehicleReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchVehicleByKey } = useVehiclesGlobalCacheActions()
    return (data) => {
      void patchVehicleByKey(data)
    }
  },
})
