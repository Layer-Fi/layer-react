import { vehicles } from '@fixtures/generated/vehicles.gen'
import { createMockStore } from '@msw/utils/createMockStore'

export const vehicleStore = createMockStore(() => vehicles)

export const enforceSinglePrimaryVehicle = (primaryId: string) => {
  vehicleStore.all().forEach((vehicle) => {
    if (vehicle.id !== primaryId && vehicle.isPrimary) {
      vehicleStore.save({ ...vehicle, isPrimary: false })
    }
  })
}
