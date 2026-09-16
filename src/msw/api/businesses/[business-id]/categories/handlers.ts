import { type RequestHandler } from 'msw'

import { get as getCategories } from '@msw/api/businesses/[business-id]/categories/get'

export const categoriesHandlers: RequestHandler[] = [
  getCategories.handler,
]
