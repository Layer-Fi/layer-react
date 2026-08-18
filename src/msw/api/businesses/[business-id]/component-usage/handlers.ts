import { type RequestHandler } from 'msw'

import { post as logComponentUsage } from '@msw/api/businesses/[business-id]/component-usage/post'

export const componentUsageHandlers: RequestHandler[] = [
  logComponentUsage.handler,
]
