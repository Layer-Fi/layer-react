import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/mileage/vehicles/:vehicleId',
  resolve: ({ params }) => {
    vehicleStore.patchById(params.vehicleId as string, vehicle => ({ ...vehicle, deletedAt: new Date() }))

    return {}
  },
})
