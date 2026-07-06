import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { type UpsertVehicleEncoded, VehicleSchema } from '@schemas/vehicle'
import { patch, post } from '@utils/api/authenticatedHttp'
import { useTripsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/trips/useListTrips'
import { useVehiclesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/mileage/vehicles/useListVehicles'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_VEHICLE_TAG_KEY = '#upsert-vehicle'

export enum UpsertVehicleMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertVehicleBody = UpsertVehicleEncoded

const UpsertVehicleReturnSchema = UnwrappedDataResponseSchema(VehicleSchema)

type UpsertVehicleReturnEncoded = typeof UpsertVehicleReturnSchema.Encoded

const createVehicle = post<UpsertVehicleReturnEncoded, UpsertVehicleBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/mileage/vehicles`,
)

const updateVehicle = patch<
  UpsertVehicleReturnEncoded,
  UpsertVehicleBody,
  { businessId: string, vehicleId: string }
>(
  ({ businessId, vehicleId }) => `/v1/businesses/${businessId}/mileage/vehicles/${vehicleId}`,
)

const useCreateVehicle = createMutationHook({
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

const useUpdateVehicle = createMutationHook({
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

type UseUpsertVehicleProps =
  | { mode: UpsertVehicleMode.Create }
  | { mode: UpsertVehicleMode.Update, vehicleId: string }

export const useUpsertVehicle = (props: UseUpsertVehicleProps) => {
  const { mode } = props
  const vehicleId = mode === UpsertVehicleMode.Update ? props.vehicleId : undefined

  const createResponse = useCreateVehicle()
  const updateResponse = useUpdateVehicle({
    vehicleId: vehicleId ?? '',
  })

  return mode === UpsertVehicleMode.Create ? createResponse : updateResponse
}
