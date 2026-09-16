import { type RequestHandler } from 'msw'

import { post as postJournalEntry } from '@msw/api/businesses/[business-id]/ledger/journal-entries/post'

export const journalEntriesHandlers: RequestHandler[] = [
  postJournalEntry.handler,
]
