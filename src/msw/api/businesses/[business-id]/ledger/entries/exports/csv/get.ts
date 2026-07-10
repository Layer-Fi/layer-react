import { type LedgerEntry, type LedgerEntryLineItem } from '@schemas/generalLedger/ledgerEntry'

import { ledgerEntryStore } from '@msw/api/businesses/[business-id]/ledger/entries/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { csvPresignedUrlResponse, formatCsvCents, formatCsvDate } from '@msw/utils/csvPresignedUrl'

const HEADER = ['Entry Number', 'Date', 'Entry Type', 'Account', 'Direction', 'Amount', 'Memo']

const toRow = (
  { entryNumber, entryAt, entryType, memo }: LedgerEntry,
  { account, direction, amount }: LedgerEntryLineItem,
) => [
  String(entryNumber ?? ''),
  formatCsvDate(entryAt),
  entryType ?? '',
  account.name,
  direction,
  formatCsvCents(amount),
  memo ?? '',
]

export const get = createMockEndpoint<undefined, ReturnType<typeof csvPresignedUrlResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/ledger/entries/exports/csv',
  resolve: () => csvPresignedUrlResponse('journal-entries.csv', [
    HEADER,
    ...ledgerEntryStore.all().flatMap(entry => entry.lineItems.map(lineItem => toRow(entry, lineItem))),
  ]),
})
