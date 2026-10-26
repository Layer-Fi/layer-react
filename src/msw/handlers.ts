import { type RequestHandler } from 'msw'

import { businessHandlers } from '@msw/api/businesses/[business-id]/handlers'

export const handlers: RequestHandler[] = [
  ...businessHandlers,
]
