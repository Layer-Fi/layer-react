import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeVehicle } from '@fixtures/vehicles/mocks'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

export const toReactivateVehicleResponse = (vehicle: Vehicle) =>
  apiData(encodeVehicle(vehicle))

export const post = createMockEndpoint<Vehicle, ReturnType<typeof toReactivateVehicleResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/mileage/vehicles/:vehicleId/reactivate',
  resolve: ({ override: vehicle = makeVehicle(), params }) =>
    toReactivateVehicleResponse({ ...vehicle, id: params.vehicleId as string, archivedAt: null }),
})
