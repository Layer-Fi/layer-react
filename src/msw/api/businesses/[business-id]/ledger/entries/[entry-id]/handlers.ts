import { type RequestHandler } from 'msw'

import { get as getLedgerEntry } from '@msw/api/businesses/[business-id]/ledger/entries/[entry-id]/get'
import { post as postReverseLedgerEntry } from '@msw/api/businesses/[business-id]/ledger/entries/[entry-id]/reverse/post'

export const entryHandlers: RequestHandler[] = [
  getLedgerEntry.handler,
  postReverseLedgerEntry.handler,
]
