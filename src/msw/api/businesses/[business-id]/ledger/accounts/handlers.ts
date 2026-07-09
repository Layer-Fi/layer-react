import { type RequestHandler } from 'msw'

import { accountHandlers } from '@msw/api/businesses/[business-id]/ledger/accounts/[account-id]/handlers'
import { post as postLedgerAccount } from '@msw/api/businesses/[business-id]/ledger/accounts/post'
import { put as putLedgerAccount } from '@msw/api/businesses/[business-id]/ledger/accounts/put'

export const accountsHandlers: RequestHandler[] = [
  postLedgerAccount.handler,
  putLedgerAccount.handler,
  ...accountHandlers,
]
