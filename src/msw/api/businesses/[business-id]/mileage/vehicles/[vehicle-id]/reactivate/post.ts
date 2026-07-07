import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'

import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { apiData } from '@msw/utils/apiResponse'
import { createEchoTransformationResolver } from '@msw/utils/createEchoResolvers'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeVehicle } from '@fixtures/vehicles/mocks'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

export const toReactivateVehicleResponse = (vehicle: Vehicle) =>
  apiData(encodeVehicle(vehicle))

export const post = createMockEndpoint<Vehicle, ReturnType<typeof toReactivateVehicleResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/mileage/vehicles/:vehicleId/reactivate',
  resolve: createEchoTransformationResolver({
    idParam: 'vehicleId',
    store: vehicleStore,
    makeBase: id => makeVehicle({ id }),
    transform: vehicle => ({ ...vehicle, archivedAt: null }),
    toResponse: toReactivateVehicleResponse,
  }),
})
