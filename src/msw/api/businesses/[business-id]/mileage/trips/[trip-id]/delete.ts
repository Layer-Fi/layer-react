import { tripStore } from '@msw/api/businesses/[business-id]/mileage/trips/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/mileage/trips/:tripId',
  resolve: ({ params }) => {
    tripStore.patchById(params.tripId as string, trip => ({ ...trip, deletedAt: new Date() }))

    return {}
  },
})
