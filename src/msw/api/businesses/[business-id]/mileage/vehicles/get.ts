import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { vehicles as defaultVehicles } from '@fixtures/generated/vehicles.gen'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

const toResponse = (vehicles: readonly Vehicle[]) =>
  apiData(vehicles.map(vehicle => encodeVehicle(vehicle)))

export const get = createMockEndpoint<readonly Vehicle[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/mileage/vehicles',
  resolve: ({ override: vehicles = defaultVehicles }) => toResponse(vehicles),
})
