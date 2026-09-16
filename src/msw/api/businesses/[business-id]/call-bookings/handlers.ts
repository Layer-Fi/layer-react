import { type RequestHandler } from 'msw'

import { get as getCallBookings } from '@msw/api/businesses/[business-id]/call-bookings/get'
import { post as createCallBooking } from '@msw/api/businesses/[business-id]/call-bookings/post'

export const callBookingsHandlers: RequestHandler[] = [
  getCallBookings.handler,
  createCallBooking.handler,
]
