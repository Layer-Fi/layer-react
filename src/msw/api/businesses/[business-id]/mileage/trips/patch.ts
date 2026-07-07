import { Schema } from 'effect'

import { type Trip, TripSchema } from '@schemas/trip'

import { tripStore } from '@msw/api/businesses/[business-id]/mileage/trips/store'
import { tripFromUpsertRequest } from '@msw/api/businesses/[business-id]/mileage/trips/tripFromUpsertRequest'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreUpdateResolver } from '@msw/utils/createStoreResolvers'
import { makeTrip } from '@fixtures/trips/mocks'

const encodeTrip = Schema.encodeSync(TripSchema)

export const toUpdateTripResponse = (trip: Trip) =>
  apiData(encodeTrip(trip))

export const patch = createMockEndpoint<Trip, ReturnType<typeof toUpdateTripResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/mileage/trips/:tripId',
  resolve: createStoreUpdateResolver({
    idParam: 'tripId',
    store: tripStore,
    makeBase: id => makeTrip({ id }),
    fromRequest: tripFromUpsertRequest,
    toResponse: toUpdateTripResponse,
  }),
})
