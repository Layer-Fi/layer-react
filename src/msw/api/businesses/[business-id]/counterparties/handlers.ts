import { type RequestHandler } from 'msw'

import { get as getCounterparties } from '@msw/api/businesses/[business-id]/counterparties/get'

export const counterpartiesHandlers: RequestHandler[] = [
  getCounterparties.handler,
]
