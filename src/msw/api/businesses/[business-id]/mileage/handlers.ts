import { type RequestHandler } from 'msw'

import { get as getMileageSummary } from '@msw/api/businesses/[business-id]/mileage/summary/get'
import { tripsHandlers } from '@msw/api/businesses/[business-id]/mileage/trips/handlers'
import { vehiclesHandlers } from '@msw/api/businesses/[business-id]/mileage/vehicles/handlers'

export const mileageHandlers: RequestHandler[] = [
  ...vehiclesHandlers,
  ...tripsHandlers,
  getMileageSummary.handler,
]
