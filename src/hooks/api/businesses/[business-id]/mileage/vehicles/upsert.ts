import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'
import { usePatchVehicle } from '@api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/patch'
import { usePostVehicle } from '@api/businesses/[business-id]/mileage/vehicles/post'

export const useUpsertVehicle = createUpsertHook({
  useCreate: usePostVehicle,
  useUpdate: usePatchVehicle,
  toCreateOptions: () => undefined,
  toUpdateOptions: (props: { vehicleId: string }) => ({ vehicleId: props.vehicleId }),
})
