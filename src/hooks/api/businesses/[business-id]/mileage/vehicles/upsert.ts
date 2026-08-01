import { usePatchVehicle } from '@api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/patch'
import { usePostVehicle } from '@api/businesses/[business-id]/mileage/vehicles/post'

export enum UpsertVehicleMode {
  Create = 'Create',
  Update = 'Update',
}

type UseUpsertVehicleProps =
  | { mode: UpsertVehicleMode.Create }
  | { mode: UpsertVehicleMode.Update, vehicleId: string }

export const useUpsertVehicle = (props: UseUpsertVehicleProps) => {
  const { mode } = props
  const vehicleId = mode === UpsertVehicleMode.Update ? props.vehicleId : undefined

  const createResponse = usePostVehicle()
  const updateResponse = usePatchVehicle({
    vehicleId: vehicleId ?? '',
  })

  return mode === UpsertVehicleMode.Create ? createResponse : updateResponse
}
