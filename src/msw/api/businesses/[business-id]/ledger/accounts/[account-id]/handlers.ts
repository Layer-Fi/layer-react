import { type RequestHandler } from 'msw'

import { del as deleteLedgerAccount } from '@msw/api/businesses/[business-id]/ledger/accounts/[account-id]/delete'
import { get as getLedgerAccountLines } from '@msw/api/businesses/[business-id]/ledger/accounts/[account-id]/lines/get'

export const accountHandlers: RequestHandler[] = [
  getLedgerAccountLines.handler,
  deleteLedgerAccount.handler,
]
