import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/features/mileage/vehicle'

import { makeVehicle } from '@fixtures/vehicles/mocks'
import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreTransformResolver } from '@msw/utils/createStoreResolvers'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

export const toReactivateVehicleResponse = (vehicle: Vehicle) =>
  apiData(encodeVehicle(vehicle))

export const post = createMockEndpoint<Vehicle, ReturnType<typeof toReactivateVehicleResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/mileage/vehicles/:vehicleId/reactivate',
  resolve: createStoreTransformResolver({
    idParam: 'vehicleId',
    store: vehicleStore,
    makeBase: id => makeVehicle({ id }),
    transform: vehicle => ({ ...vehicle, archivedAt: null }),
    toResponse: toReactivateVehicleResponse,
  }),
})
