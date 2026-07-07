import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'

import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { apiData } from '@msw/utils/apiResponse'
import { createListFilter, notDeleted, requiresFlag } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

const toResponse = (vehicles: readonly Vehicle[]) =>
  apiData(vehicles.map(vehicle => encodeVehicle(vehicle)))

const filterVehicles = createListFilter<Vehicle>({
  allow_archived: requiresFlag(vehicle => vehicle.archivedAt != null),
})

export const get = createMockEndpoint<readonly Vehicle[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/mileage/vehicles',
  resolve: ({ override: vehicles = vehicleStore.all(), request }) =>
    toResponse(filterVehicles(vehicles.filter(notDeleted), request)),
})
