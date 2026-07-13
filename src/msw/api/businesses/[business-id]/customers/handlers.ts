import { type RequestHandler } from 'msw'

import { get as getCustomers } from '@msw/api/businesses/[business-id]/customers/get'
import { patch as patchCustomer } from '@msw/api/businesses/[business-id]/customers/patch'
import { post as postCustomer } from '@msw/api/businesses/[business-id]/customers/post'

export const customersHandlers: RequestHandler[] = [
  getCustomers.handler,
  postCustomer.handler,
  patchCustomer.handler,
]
