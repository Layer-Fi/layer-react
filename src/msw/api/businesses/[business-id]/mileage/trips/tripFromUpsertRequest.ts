import { BigDecimal, Schema } from 'effect'

import { type Trip, TripDistanceSource, TripPurpose, UpsertTripSchema } from '@schemas/trip'

import { vehicleStore } from '@msw/api/businesses/[business-id]/mileage/vehicles/store'
import { readRequestJson } from '@msw/utils/request'
import { resolveEmbedded } from '@msw/utils/resolveEmbedded'

const decodeUpsert = Schema.decodeUnknownSync(UpsertTripSchema)

const toTripPurpose = (purpose: string): TripPurpose =>
  Object.values(TripPurpose).includes(purpose as TripPurpose)
    ? purpose as TripPurpose
    : TripPurpose.Business

/* Stands in for the server-side Routes API computation. */
const MOCK_COMPUTED_DISTANCE = BigDecimal.unsafeFromString('42.7')

export const tripFromUpsertRequest = async (request: Request, base: Trip): Promise<Trip> => {
  const { vehicleId, purpose, distance, ...scalars } = decodeUpsert(await readRequestJson(request))

  const hasBothPlaces = Boolean(scalars.googleStartPlaceId && scalars.googleEndPlaceId)

  return {
    ...base,
    ...scalars,
    distance: distance ?? (hasBothPlaces ? MOCK_COMPUTED_DISTANCE : base.distance),
    distanceSource: distance != null || !hasBothPlaces
      ? TripDistanceSource.Manual
      : TripDistanceSource.Computed,
    purpose: toTripPurpose(purpose),
    vehicle: resolveEmbedded({
      requestedId: vehicleId ?? null,
      fallback: base.vehicle,
      lookup: id => vehicleStore.findById(id),
    }),
  }
}
