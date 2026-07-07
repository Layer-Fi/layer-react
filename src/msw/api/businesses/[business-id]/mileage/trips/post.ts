import { Schema } from 'effect'

import { type Trip, TripSchema } from '@schemas/trip'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeTrip } from '@fixtures/trips/mocks'

const encodeTrip = Schema.encodeSync(TripSchema)

export const toCreateTripResponse = (trip: Trip) =>
  apiData(encodeTrip(trip))

export const post = createMockEndpoint<Trip, ReturnType<typeof toCreateTripResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/mileage/trips',
  resolve: ({ override: trip = makeTrip() }) => toCreateTripResponse(trip),
})
