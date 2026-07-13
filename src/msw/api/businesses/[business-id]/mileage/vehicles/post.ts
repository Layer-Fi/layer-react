import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'

import { enforceSinglePrimaryVehicle, vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { vehicleFromUpsertRequest } from '@msw/api/businesses/[business-id]/mileage/vehicles/vehicleFromUpsertRequest'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeVehicle } from '@fixtures/vehicles/mocks'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

export const toCreateVehicleResponse = (vehicle: Vehicle) =>
  apiData(encodeVehicle(vehicle))

const resolveCreate = createStoreCreateResolver({
  store: vehicleStore,
  makeBase: id => makeVehicle({ id }),
  fromRequest: vehicleFromUpsertRequest,
  toResponse: toCreateVehicleResponse,
})

export const post = createMockEndpoint<Vehicle, ReturnType<typeof toCreateVehicleResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/mileage/vehicles',
  resolve: async (context) => {
    const response = await resolveCreate(context)

    const created = vehicleStore.findById(response.data.id)
    if (created?.isPrimary) enforceSinglePrimaryVehicle(created.id)

    return response
  },
})
