import { type RequestHandler } from 'msw'

import { del as deleteTrip } from '@msw/api/businesses/[business-id]/mileage/trips/[trip-id]/delete'
import { get as getTrips } from '@msw/api/businesses/[business-id]/mileage/trips/get'
import { patch as patchTrip } from '@msw/api/businesses/[business-id]/mileage/trips/patch'
import { post as postTrip } from '@msw/api/businesses/[business-id]/mileage/trips/post'

export const tripsHandlers: RequestHandler[] = [
  getTrips.handler,
  postTrip.handler,
  patchTrip.handler,
  deleteTrip.handler,
]
