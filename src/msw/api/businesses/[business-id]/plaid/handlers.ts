import { type RequestHandler } from 'msw'

import { post as exchangePlaidPublicToken } from '@msw/api/businesses/[business-id]/plaid/link/exchange/post'
import { post as createPlaidLink } from '@msw/api/businesses/[business-id]/plaid/link/post'

export const plaidHandlers: RequestHandler[] = [
  createPlaidLink.handler,
  exchangePlaidPublicToken.handler,
]
