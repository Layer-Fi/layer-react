import { type RequestHandler } from 'msw'

import { vehicleHandlers } from '@msw/api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/handlers'
import { get as getVehicles } from '@msw/api/businesses/[business-id]/mileage/vehicles/get'
import { patch as patchVehicle } from '@msw/api/businesses/[business-id]/mileage/vehicles/patch'
import { post as postVehicle } from '@msw/api/businesses/[business-id]/mileage/vehicles/post'

export const vehiclesHandlers: RequestHandler[] = [
  getVehicles.handler,
  postVehicle.handler,
  patchVehicle.handler,
  ...vehicleHandlers,
]
