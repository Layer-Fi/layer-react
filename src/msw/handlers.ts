import { type RequestHandler } from 'msw'

import { get as getCustomAccounts } from '@msw/api/businesses/[business-id]/custom-accounts/get'

// One entry per endpoint. Folders mirror the API path layout; tests override
// individual endpoints via `server.use(...)`.
export const handlers: RequestHandler[] = [
  getCustomAccounts.handler,
]
