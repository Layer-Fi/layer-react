import { Schema } from 'effect'

import { UpsertVehicleSchema, type Vehicle } from '@schemas/vehicle'

import { createUpsertRequestEcho } from '@msw/utils/createEchoResolvers'

export const vehicleFromUpsertRequest = createUpsertRequestEcho<Vehicle>(
  Schema.decodeUnknownSync(UpsertVehicleSchema),
)
