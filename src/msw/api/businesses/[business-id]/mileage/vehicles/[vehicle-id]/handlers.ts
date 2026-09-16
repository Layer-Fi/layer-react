import { type RequestHandler } from 'msw'

import { post as postArchiveVehicle } from '@msw/api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/archive/post'
import { del as deleteVehicle } from '@msw/api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/delete'
import { post as postReactivateVehicle } from '@msw/api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/reactivate/post'

export const vehicleHandlers: RequestHandler[] = [
  postArchiveVehicle.handler,
  postReactivateVehicle.handler,
  deleteVehicle.handler,
]
