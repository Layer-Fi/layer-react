import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'

import { enforceSinglePrimaryVehicle, vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { vehicleFromUpsertRequest } from '@msw/api/businesses/[business-id]/mileage/vehicles/vehicleFromUpsertRequest'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreUpdateResolver } from '@msw/utils/createStoreResolvers'
import { makeVehicle } from '@fixtures/vehicles/mocks'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

export const toUpdateVehicleResponse = (vehicle: Vehicle) =>
  apiData(encodeVehicle(vehicle))

const resolveUpdate = createStoreUpdateResolver({
  idParam: 'vehicleId',
  store: vehicleStore,
  makeBase: id => makeVehicle({ id }),
  fromRequest: vehicleFromUpsertRequest,
  toResponse: toUpdateVehicleResponse,
})

export const patch = createMockEndpoint<Vehicle, ReturnType<typeof toUpdateVehicleResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/mileage/vehicles/:vehicleId',
  resolve: async (context) => {
    const response = await resolveUpdate(context)

    const updated = vehicleStore.findById(context.params.vehicleId as string)
    if (updated?.isPrimary) enforceSinglePrimaryVehicle(updated.id)

    return response
  },
})
