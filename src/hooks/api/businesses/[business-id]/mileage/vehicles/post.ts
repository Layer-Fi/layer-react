import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type UpsertVehicleEncoded } from '@schemas/features/mileage/upsertVehicle'
import { VehicleSchema } from '@schemas/features/mileage/vehicle'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useVehiclesGlobalCacheActions } from '@api/businesses/[business-id]/mileage/vehicles/get'

export const UPSERT_VEHICLE_TAG_KEY = '#upsert-vehicle'

export type UpsertVehicleBody = UpsertVehicleEncoded

export const UpsertVehicleReturnSchema = UnwrappedDataResponseSchema(VehicleSchema)

export type UpsertVehicleReturnEncoded = typeof UpsertVehicleReturnSchema.Encoded

const createVehicle = post<UpsertVehicleReturnEncoded, UpsertVehicleBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/mileage/vehicles`,
)

export const usePostVehicle = createMutationHook({
  tags: [UPSERT_VEHICLE_TAG_KEY],
  request: createVehicle,
  schema: UpsertVehicleReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadVehicles } = useVehiclesGlobalCacheActions()

    return () => {
      void forceReloadVehicles()
    }
  },
})
