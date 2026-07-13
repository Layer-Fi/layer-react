import { Schema } from 'effect'

import { type Trip, TripPurpose, UpsertTripSchema } from '@schemas/trip'

import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { readRequestJson } from '@msw/utils/request'
import { resolveEmbedded } from '@msw/utils/resolveEmbedded'

const decodeUpsert = Schema.decodeUnknownSync(UpsertTripSchema)

const toTripPurpose = (purpose: string): TripPurpose =>
  Object.values(TripPurpose).includes(purpose as TripPurpose)
    ? purpose as TripPurpose
    : TripPurpose.Business

export const tripFromUpsertRequest = async (request: Request, base: Trip): Promise<Trip> => {
  const { vehicleId, purpose, ...scalars } = decodeUpsert(await readRequestJson(request))

  return {
    ...base,
    ...scalars,
    purpose: toTripPurpose(purpose),
    vehicle: resolveEmbedded({
      requestedId: vehicleId ?? null,
      fallback: base.vehicle,
      lookup: id => vehicleStore.findById(id),
    }),
  }
}
