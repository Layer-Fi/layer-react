import { type RequestHandler } from 'msw'

import { get as getCallBookings } from '@msw/api/businesses/[business-id]/call-bookings/get'

export const callBookingsHandlers: RequestHandler[] = [
  getCallBookings.handler,
]
