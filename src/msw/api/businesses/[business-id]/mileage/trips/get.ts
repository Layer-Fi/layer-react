import { Schema } from 'effect'

import { type Trip, TripSchema } from '@schemas/trip'

import { tripStore } from '@msw/api/businesses/[business-id]/mileage/trips/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesQuery, matchesValue, notDeleted } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeTrip = Schema.encodeSync(TripSchema)

const toResponse = (trips: readonly Trip[], request: Request) =>
  paginatedApiData(trips.map(trip => encodeTrip(trip)), request)

const filterTrips = createListFilter<Trip>({
  q: matchesQuery(trip => [trip.startAddress, trip.endAddress, trip.description]),
  vehicle_ids: matchesValue(trip => trip.vehicle?.id),
  purpose: matchesValue(trip => trip.purpose),
  year: matchesValue(trip => trip.tripDate.year),
})

export const get = createMockEndpoint<readonly Trip[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/mileage/trips',
  resolve: ({ override: trips = tripStore.all(), request }) =>
    toResponse(filterTrips(trips.filter(notDeleted), request), request),
})
