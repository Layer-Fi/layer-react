import { Schema } from 'effect'

import { type Trip, TripSchema } from '@schemas/trip'

import { tripStore } from '@msw/api/businesses/[business-id]/mileage/trips/store'
import { tripFromUpsertRequest } from '@msw/api/businesses/[business-id]/mileage/trips/tripFromUpsertRequest'
import { apiData } from '@msw/utils/apiResponse'
import { createEchoCreateResolver } from '@msw/utils/createEchoResolvers'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeTrip } from '@fixtures/trips/mocks'

const encodeTrip = Schema.encodeSync(TripSchema)

export const toCreateTripResponse = (trip: Trip) =>
  apiData(encodeTrip(trip))

export const post = createMockEndpoint<Trip, ReturnType<typeof toCreateTripResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/mileage/trips',
  resolve: createEchoCreateResolver({
    store: tripStore,
    makeBase: id => makeTrip({ id }),
    fromRequest: tripFromUpsertRequest,
    toResponse: toCreateTripResponse,
  }),
})
