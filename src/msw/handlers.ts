import { type RequestHandler } from 'msw'

import { get as getCustomAccounts } from '@msw/api/businesses/[business-id]/custom-accounts/get'

export const handlers: RequestHandler[] = [
  getCustomAccounts.handler,
]
