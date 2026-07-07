import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'

import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { vehicleFromUpsertRequest } from '@msw/api/businesses/[business-id]/mileage/vehicles/vehicleFromUpsertRequest'
import { apiData } from '@msw/utils/apiResponse'
import { createEchoCreateResolver } from '@msw/utils/createEchoResolvers'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeVehicle } from '@fixtures/vehicles/mocks'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

export const toCreateVehicleResponse = (vehicle: Vehicle) =>
  apiData(encodeVehicle(vehicle))

export const post = createMockEndpoint<Vehicle, ReturnType<typeof toCreateVehicleResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/mileage/vehicles',
  resolve: createEchoCreateResolver({
    store: vehicleStore,
    makeBase: id => makeVehicle({ id }),
    fromRequest: vehicleFromUpsertRequest,
    toResponse: toCreateVehicleResponse,
  }),
})
