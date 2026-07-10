import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreDeleteResolver } from '@msw/utils/createStoreResolvers'

export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/mileage/vehicles/:vehicleId',
  resolve: createStoreDeleteResolver({
    idParam: 'vehicleId',
    store: vehicleStore,
    markDeleted: vehicle => ({ ...vehicle, deletedAt: new Date() }),
  }),
})
