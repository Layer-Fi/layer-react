import { Schema } from 'effect'

import { type LedgerEntry, LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'

import { ledgerEntryStore } from '@msw/api/businesses/[business-id]/ledger/entries/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesOnOrAfter, matchesOnOrBefore } from '@msw/utils/createListFilter'
import { createListSorter } from '@msw/utils/createListSorter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeLedgerEntry = Schema.encodeSync(LedgerEntrySchema)

const toResponse = (entries: readonly LedgerEntry[], request: Request) =>
  paginatedApiData(entries.map(entry => encodeLedgerEntry(entry)), request)

export const filterLedgerEntries = createListFilter<LedgerEntry>({
  start_date: matchesOnOrAfter(entry => entry.entryAt),
  end_date: matchesOnOrBefore(entry => entry.entryAt),
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
