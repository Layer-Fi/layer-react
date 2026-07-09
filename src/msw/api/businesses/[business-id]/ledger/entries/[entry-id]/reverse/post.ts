import { LedgerEntryDirection } from '@schemas/generalLedger/ledgerAccount'
import { EntryType, type LedgerEntry, type LedgerEntryLineItem } from '@schemas/generalLedger/ledgerEntry'

import { ledgerEntryStore } from '@msw/api/businesses/[business-id]/ledger/entries/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeManualEntrySource } from '@fixtures/ledgerEntries/sources'

const flip = (direction: LedgerEntryDirection) =>
  direction === LedgerEntryDirection.Debit ? LedgerEntryDirection.Credit : LedgerEntryDirection.Debit

const buildReversalEntry = (original: LedgerEntry): LedgerEntry => {
  const reversalEntryId = crypto.randomUUID()
  const reversedAt = new Date()

  const lineItems: LedgerEntryLineItem[] = original.lineItems.map(lineItem => ({
    ...lineItem,
    id: crypto.randomUUID(),
    entryId: reversalEntryId,
    direction: flip(lineItem.direction),
    entryAt: reversedAt,
    createdAt: reversedAt,
    entryReversalOf: lineItem.id,
    entryReversedBy: null,
  }))

  return {
    ...original,
    id: reversalEntryId,
    entryNumber: null,
    entryType: EntryType.Reversal,
    date: reversedAt,
    entryAt: reversedAt,
    reversalOfId: original.id,
    reversalId: null,
    lineItems,
    source: makeManualEntrySource({ id: reversalEntryId, memo: original.memo ?? null }),
  }
}

export const post = createMockEndpoint<undefined, Record<string, never>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/ledger/entries/:entryId/reverse',
  resolve: ({ params }) => {
    const original = ledgerEntryStore.findById(params.entryId as string)
    if (!original || original.reversalId != null) return {}

    const reversal = buildReversalEntry(original)
    ledgerEntryStore.save(reversal)

    ledgerEntryStore.save({
      ...original,
      reversalId: reversal.id,
      lineItems: original.lineItems.map((lineItem, index) => ({
        ...lineItem,
        entryReversedBy: reversal.lineItems[index].id,
      })),
    })

    return {}
  },
})
