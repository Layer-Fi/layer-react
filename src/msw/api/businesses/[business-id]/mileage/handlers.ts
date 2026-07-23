import { type RequestHandler } from 'msw'

import { get as getAddressDetails } from '@msw/api/businesses/[business-id]/mileage/address-details/get'
import { get as getAddressSuggestions } from '@msw/api/businesses/[business-id]/mileage/address-suggestions/get'
import { get as getMileageDistance } from '@msw/api/businesses/[business-id]/mileage/distance/get'
import { get as getMileageSummary } from '@msw/api/businesses/[business-id]/mileage/summary/get'
import { tripsHandlers } from '@msw/api/businesses/[business-id]/mileage/trips/handlers'
import { vehiclesHandlers } from '@msw/api/businesses/[business-id]/mileage/vehicles/handlers'

export const mileageHandlers: RequestHandler[] = [
  ...vehiclesHandlers,
  ...tripsHandlers,
  getMileageSummary.handler,
  getAddressSuggestions.handler,
  getAddressDetails.handler,
  getMileageDistance.handler,
]
