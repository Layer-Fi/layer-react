import { Schema } from 'effect'

import { UpsertVehicleSchema, type Vehicle } from '@schemas/vehicle'

import { readRequestJson } from '@msw/utils/request'

const decodeUpsertVehicle = Schema.decodeUnknownSync(UpsertVehicleSchema)

/*
 * Builds the response vehicle by echoing the upsert request body over `base`,
 * so the default mock returns what the client submitted instead of an
 * unrelated fixture (which would flash stale values into the SWR cache).
 */
export const vehicleFromUpsertRequest = async (request: Request, base: Vehicle): Promise<Vehicle> => {
  const body = decodeUpsertVehicle(await readRequestJson(request))

  return {
    ...base,
    makeAndModel: body.makeAndModel,
    year: body.year ?? null,
    licensePlate: body.licensePlate ?? null,
    vin: body.vin ?? null,
    description: body.description ?? null,
    isPrimary: body.isPrimary,
  }
}
