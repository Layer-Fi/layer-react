import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'

import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

const toResponse = (vehicles: readonly Vehicle[]) =>
  apiData(vehicles.map(vehicle => encodeVehicle(vehicle)))

export const get = createMockEndpoint<readonly Vehicle[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/mileage/vehicles',
  resolve: ({ override: vehicles = vehicleStore.all(), request }) => {
    // Mirror the real endpoint: archived vehicles are only included with `?allow_archived=true`.
    const allowArchived = new URL(request.url).searchParams.get('allow_archived') === 'true'

    const filtered = vehicles.filter(({ deletedAt, archivedAt }) =>
      deletedAt == null && (allowArchived || archivedAt == null))

    return toResponse(filtered)
  },
})
