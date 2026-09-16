import { tripStore } from '@msw/api/businesses/[business-id]/mileage/trips/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreDeleteResolver } from '@msw/utils/createStoreResolvers'

export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/mileage/trips/:tripId',
  resolve: createStoreDeleteResolver({
    idParam: 'tripId',
    store: tripStore,
    markDeleted: trip => ({ ...trip, deletedAt: new Date() }),
  }),
})
