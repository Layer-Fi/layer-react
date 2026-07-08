import { Schema } from 'effect'

import { type Trip, TripPurpose, UpsertTripSchema } from '@schemas/trip'

import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { readRequestJson } from '@msw/utils/request'
import { resolveEmbedded } from '@msw/utils/resolveEmbedded'

const decodeUpsertTrip = Schema.decodeUnknownSync(UpsertTripSchema)

const toTripPurpose = (purpose: string): TripPurpose =>
  Object.values(TripPurpose).includes(purpose as TripPurpose)
    ? purpose as TripPurpose
    : TripPurpose.Business

export const tripFromUpsertRequest = async (request: Request, base: Trip): Promise<Trip> => {
  const body = decodeUpsertTrip(await readRequestJson(request))

  return {
    ...base,
    vehicle: resolveEmbedded(
      body.vehicleId ?? null,
      base.vehicle,
      id => vehicleStore.findById(id) ?? base.vehicle,
    ),
    tripDate: body.tripDate,
    distance: body.distance,
    purpose: toTripPurpose(body.purpose),
    startAddress: body.startAddress ?? null,
    endAddress: body.endAddress ?? null,
    description: body.description ?? null,
  }
}
