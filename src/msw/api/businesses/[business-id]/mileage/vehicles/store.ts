import { createMockStore } from '@msw/utils/createMockStore'
import { vehicles } from '@fixtures/generated/vehicles.gen'

export const vehicleStore = createMockStore(() => vehicles)
