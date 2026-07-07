import { Schema } from 'effect'

import { type Trip, TripPurpose, UpsertTripSchema } from '@schemas/trip'

import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { readRequestJson } from '@msw/utils/request'

const decodeUpsertTrip = Schema.decodeUnknownSync(UpsertTripSchema)

const toTripPurpose = (purpose: string): TripPurpose =>
  Object.values(TripPurpose).includes(purpose as TripPurpose)
    ? purpose as TripPurpose
    : TripPurpose.Business

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
