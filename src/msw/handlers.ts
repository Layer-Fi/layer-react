import { type RequestHandler } from 'msw'

import { businessHandlers } from '@msw/api/businesses/[business-id]/handlers'
import { post as postOAuthToken } from '@msw/api/oauth2/token/post'

export const handlers: RequestHandler[] = [
  postOAuthToken.handler,
  ...businessHandlers,
]
