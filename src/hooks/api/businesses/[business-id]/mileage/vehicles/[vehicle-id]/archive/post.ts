import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { VehicleSchema } from '@schemas/features/mileage/vehicle'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useVehiclesGlobalCacheActions } from '@api/businesses/[business-id]/mileage/vehicles/get'

const ARCHIVE_VEHICLE_TAG_KEY = '#archive-vehicle'

const ArchiveVehicleReturnSchema = UnwrappedDataResponseSchema(VehicleSchema)

const archiveVehicle = post<
  typeof ArchiveVehicleReturnSchema.Encoded,
  Record<string, never>,
  { businessId: string, vehicleId: string }
>(({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}/archive`)

export const usePostArchiveVehicle = createMutationHook({
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
