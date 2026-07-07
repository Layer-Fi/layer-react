import { type RequestHandler } from 'msw'

import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'

export const bankAccountsHandlers: RequestHandler[] = [
  getBankAccounts.handler,
]
