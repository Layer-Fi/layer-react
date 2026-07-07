import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeVehicle } from '@fixtures/vehicles/mocks'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

export const toUpdateVehicleResponse = (vehicle: Vehicle) =>
  apiData(encodeVehicle(vehicle))

export const patch = createMockEndpoint<Vehicle, ReturnType<typeof toUpdateVehicleResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/mileage/vehicles/:vehicleId',
  resolve: ({ override: vehicle = makeVehicle(), params }) =>
    toUpdateVehicleResponse({ ...vehicle, id: params.vehicleId as string }),
})
