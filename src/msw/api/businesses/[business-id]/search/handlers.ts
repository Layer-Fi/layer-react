import { type RequestHandler } from 'msw'

import { get as getUnifiedSearch } from '@msw/api/businesses/[business-id]/search/get'

export const searchHandlers: RequestHandler[] = [
  getUnifiedSearch.handler,
]
