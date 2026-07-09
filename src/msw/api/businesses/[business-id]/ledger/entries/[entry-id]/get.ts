import { Schema } from 'effect'

import { type LedgerEntry, LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'

import { ledgerEntryStore } from '@msw/api/businesses/[business-id]/ledger/entries/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeLedgerEntry } from '@fixtures/ledgerEntries/mocks'

const encodeLedgerEntry = Schema.encodeSync(LedgerEntrySchema)

export const toEntryResponse = (entry: LedgerEntry) => apiData(encodeLedgerEntry(entry))

export const get = createMockEndpoint<LedgerEntry, ReturnType<typeof toEntryResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/ledger/entries/:entryId',
  resolve: ({ override, params }) => {
    const id = params.entryId as string
    const entry = override ?? ledgerEntryStore.findById(id) ?? makeLedgerEntry({ id })

    return toEntryResponse(entry)
  },
})
