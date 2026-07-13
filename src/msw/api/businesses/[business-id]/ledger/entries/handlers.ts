import { type RequestHandler } from 'msw'

import { entryHandlers } from '@msw/api/businesses/[business-id]/ledger/entries/[entry-id]/handlers'
import { get as getJournalEntriesCsv } from '@msw/api/businesses/[business-id]/ledger/entries/exports/csv/get'
import { get as getLedgerEntries } from '@msw/api/businesses/[business-id]/ledger/entries/get'

export const entriesHandlers: RequestHandler[] = [
  getLedgerEntries.handler,
  getJournalEntriesCsv.handler,
  ...entryHandlers,
]
