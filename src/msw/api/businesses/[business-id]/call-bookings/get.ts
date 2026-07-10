import { Schema } from 'effect'

import { type CallBooking, ListCallBookingsResponseSchema } from '@schemas/callBooking'

import { paginatedApiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeCallBookings = Schema.encodeSync(ListCallBookingsResponseSchema.fields.data)

export const get = createMockEndpoint<readonly CallBooking[], ReturnType<typeof paginatedApiData>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/call-bookings',
  resolve: ({ override: callBookings = [], request }) =>
    paginatedApiData(encodeCallBookings(callBookings), request),
})
