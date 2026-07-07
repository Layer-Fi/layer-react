import { Schema } from 'effect'

import { type Trip, TripSchema } from '@schemas/trip'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeTrip } from '@fixtures/trips/mocks'

const encodeTrip = Schema.encodeSync(TripSchema)

export const toUpdateTripResponse = (trip: Trip) =>
  apiData(encodeTrip(trip))

export const patch = createMockEndpoint<Trip, ReturnType<typeof toUpdateTripResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/mileage/trips/:tripId',
  resolve: ({ override: trip = makeTrip(), params }) =>
    toUpdateTripResponse({ ...trip, id: params.tripId as string }),
})
