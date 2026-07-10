import { Schema } from 'effect'

import { type LedgerEntry, type LedgerEntryLineItem } from '@schemas/generalLedger/ledgerEntry'
import {
  type ApiCustomJournalEntryLineItem,
  type ApiLedgerEntry,
  CreateCustomJournalEntrySchema,
  JournalEntryReturnSchema,
} from '@components/Journal/JournalEntryForm/journalEntryFormSchemas'

import { ledgerEntryStore } from '@msw/api/businesses/[business-id]/ledger/entries/store'
import { journalEntryFromCreateRequest } from '@msw/api/businesses/[business-id]/ledger/journal-entries/journalEntryFromCreateRequest'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { makeLedgerEntry } from '@fixtures/ledgerEntries/mocks'

const decodeCreateRequest = Schema.decodeUnknownSync(CreateCustomJournalEntrySchema)
const encodeResponse = Schema.encodeSync(JournalEntryReturnSchema)

const toApiCustomLineItem = ({ id, customer, vendor }: LedgerEntryLineItem): ApiCustomJournalEntryLineItem => ({
  id,
  lineItemId: id,
  externalId: null,
  memo: null,
  customer,
  vendor,
  transactionTags: [],
})

const toApiLedgerEntry = ({ id, date, source: _source, ...entry }: LedgerEntry): ApiLedgerEntry => ({
  ...entry,
  entryId: id,
  createdAt: date,
})

export const toCreateJournalEntryResponse = (
  entry: LedgerEntry,
  { createdBy, externalId }: { createdBy: string, externalId: string | null },
) => {
  const { id, customer, vendor, lineItems, transactionTags, memo, metadata, referenceNumber } = entry

  return encodeResponse({
    data: {
      id: crypto.randomUUID(),
      externalId,
      createdBy,
      memo: memo ?? '',
      entryId: id,
      customer,
      vendor,
      lineItems: lineItems.map(toApiCustomLineItem),
      entry: toApiLedgerEntry(entry),
      transactionTags,
      metadata,
      referenceNumber,
    },
  })
}

export const post = createMockEndpoint<LedgerEntry, ReturnType<typeof toCreateJournalEntryResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/ledger/journal-entries',
  resolve: async ({ override, request }) => {
    if (override) return toCreateJournalEntryResponse(override, { createdBy: 'test', externalId: null })

    const body = decodeCreateRequest(await readRequestJson(request))
    const entry = journalEntryFromCreateRequest(body, makeLedgerEntry({ id: crypto.randomUUID() }))

    ledgerEntryStore.save(entry)

    return toCreateJournalEntryResponse(entry, {
      createdBy: body.createdBy,
      externalId: body.externalId ?? null,
    })
  },
})
