import { Schema } from 'effect'

import { UpsertVehicleSchema, type Vehicle } from '@schemas/mileage/vehicle'

import { createRequestBodyEcho } from '@msw/utils/createRequestBodyEcho'

export const vehicleFromUpsertRequest = createRequestBodyEcho<Vehicle>(
  Schema.decodeUnknownSync(UpsertVehicleSchema),
)
