import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/mileage/vehicles/:vehicleId',
  resolve: () => ({}),
})
