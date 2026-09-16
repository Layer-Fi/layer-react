import { type RequestHandler } from 'msw'

import { accountsHandlers } from '@msw/api/businesses/[business-id]/ledger/accounts/handlers'
import { balancesHandlers } from '@msw/api/businesses/[business-id]/ledger/balances/handlers'
import { entriesHandlers } from '@msw/api/businesses/[business-id]/ledger/entries/handlers'
import { journalEntriesHandlers } from '@msw/api/businesses/[business-id]/ledger/journal-entries/handlers'

export const ledgerHandlers: RequestHandler[] = [
  ...accountsHandlers,
  ...balancesHandlers,
  ...entriesHandlers,
  ...journalEntriesHandlers,
]
