import { Schema } from 'effect'

import { UpsertVehicleSchema } from '@schemas/features/mileage/upsertVehicle'
import { type Vehicle } from '@schemas/features/mileage/vehicle'

import { createRequestBodyEcho } from '@msw/utils/createRequestBodyEcho'

export const vehicleFromUpsertRequest = createRequestBodyEcho<Vehicle>(
  Schema.decodeUnknownSync(UpsertVehicleSchema),
)
