import { type RequestHandler } from 'msw'

import { get as getVendors } from '@msw/api/businesses/[business-id]/vendors/get'
import { post as postVendor } from '@msw/api/businesses/[business-id]/vendors/post'

export const vendorsHandlers: RequestHandler[] = [
  getVendors.handler,
  postVendor.handler,
]
