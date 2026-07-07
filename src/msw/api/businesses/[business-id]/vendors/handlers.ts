import { type RequestHandler } from 'msw'

import { get as getVendors } from '@msw/api/businesses/[business-id]/vendors/get'

export const vendorsHandlers: RequestHandler[] = [
  getVendors.handler,
]
