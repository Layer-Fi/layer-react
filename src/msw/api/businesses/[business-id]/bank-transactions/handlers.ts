import { type RequestHandler } from 'msw'

import { get as getBankTransactions } from '@msw/api/businesses/[business-id]/bank-transactions/get'

export const bankTransactionsHandlers: RequestHandler[] = [
  getBankTransactions.handler,
]
