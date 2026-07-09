import { Schema } from 'effect'

import { type LedgerEntry, LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'

import { ledgerEntryStore } from '@msw/api/businesses/[business-id]/ledger/entries/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter } from '@msw/utils/createListFilter'
import { createListSorter } from '@msw/utils/createListSorter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeLedgerEntry = Schema.encodeSync(LedgerEntrySchema)

const toResponse = (entries: readonly LedgerEntry[], request: Request) =>
  paginatedApiData(entries.map(entry => encodeLedgerEntry(entry)), request)

// start_date/end_date arrive as date-only strings, so compare calendar days, not instants.
const toDateOnly = (date: Date) => date.toISOString().slice(0, 10)

export const filterLedgerEntries = createListFilter<LedgerEntry>({
  start_date: (entry, value) => !value || toDateOnly(entry.entryAt) >= value,
  end_date: (entry, value) => !value || toDateOnly(entry.entryAt) <= value,
})

const sortLedgerEntries = createListSorter<LedgerEntry>({
  entry_at: entry => entry.entryAt.getTime(),
  created_at: entry => entry.entryAt.getTime(),
  entry_number: entry => entry.entryNumber ?? 0,
}, 'entry_at')

export const get = createMockEndpoint<readonly LedgerEntry[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/ledger/entries',
  resolve: ({ override: entries = ledgerEntryStore.all(), request }) =>
    toResponse(sortLedgerEntries(filterLedgerEntries(entries, request), request), request),
})
