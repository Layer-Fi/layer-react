import { type RequestHandler } from 'msw'

import { get as getAccountBalancesCsv } from '@msw/api/businesses/[business-id]/ledger/balances/exports/csv/get'
import { get as getLedgerBalances } from '@msw/api/businesses/[business-id]/ledger/balances/get'

export const balancesHandlers: RequestHandler[] = [
  getLedgerBalances.handler,
  getAccountBalancesCsv.handler,
]
