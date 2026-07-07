import { Schema } from 'effect'

import { type Vehicle, VehicleSchema } from '@schemas/vehicle'

import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeVehicle } from '@fixtures/vehicles/mocks'

const encodeVehicle = Schema.encodeSync(VehicleSchema)

export const toArchiveVehicleResponse = (vehicle: Vehicle) =>
  apiData(encodeVehicle(vehicle))

export const post = createMockEndpoint<Vehicle, ReturnType<typeof toArchiveVehicleResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/mileage/vehicles/:vehicleId/archive',
  resolve: ({ override, params }) => {
    const vehicleId = params.vehicleId as string

    if (override) return toArchiveVehicleResponse({ ...override, id: vehicleId, archivedAt: new Date() })

    const vehicle = vehicleStore.patchById(vehicleId, existing => ({ ...existing, archivedAt: new Date() }))
      ?? makeVehicle({ id: vehicleId, archivedAt: new Date() })

    return toArchiveVehicleResponse(vehicle)
  },
})
