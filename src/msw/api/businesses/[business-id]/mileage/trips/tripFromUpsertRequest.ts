import { Schema } from 'effect'

import { type Trip, TripPurpose, UpsertTripSchema } from '@schemas/trip'

import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { readRequestJson } from '@msw/utils/request'

const decodeUpsertTrip = Schema.decodeUnknownSync(UpsertTripSchema)

const toTripPurpose = (purpose: string): TripPurpose =>
  Object.values(TripPurpose).includes(purpose as TripPurpose)
    ? purpose as TripPurpose
    : TripPurpose.Business

/*
 * Builds the response trip by echoing the upsert request body over `base`, so
 * the default mock returns what the client submitted instead of an unrelated
 * fixture (which would flash stale values into the SWR cache).
 */
export const tripFromUpsertRequest = async (request: Request, base: Trip): Promise<Trip> => {
  const body = decodeUpsertTrip(await readRequestJson(request))

  return {
    ...base,
    vehicle: body.vehicleId == null
      ? null
      : vehicleStore.findById(body.vehicleId) ?? base.vehicle,
    tripDate: body.tripDate,
    distance: body.distance,
    purpose: toTripPurpose(body.purpose),
    startAddress: body.startAddress ?? null,
    endAddress: body.endAddress ?? null,
    description: body.description ?? null,
  }
}
