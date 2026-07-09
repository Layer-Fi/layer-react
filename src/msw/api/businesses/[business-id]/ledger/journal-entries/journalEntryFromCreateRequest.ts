import { type AccountIdentifier } from '@schemas/accountIdentifier'
import { EntryType, type LedgerEntry, type LedgerEntryLineItem } from '@schemas/generalLedger/ledgerEntry'
import { type CreateCustomJournalEntry } from '@components/Journal/JournalEntryForm/journalEntryFormSchemas'

import { ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { makeManualEntrySource } from '@fixtures/ledgerEntries/sources'

const resolveAccount = (identifier: AccountIdentifier) => {
  const account = identifier.type === 'StableName'
    ? ledgerAccountStore.all().find(candidate => candidate.stableName === identifier.stableName)
    : ledgerAccountStore.findById(identifier.id)

  if (!account) throw new Error(`Mock ledger account not found for identifier: ${JSON.stringify(identifier)}`)

  return account
}

const toLineItem = (
  { accountIdentifier, amount, direction }: CreateCustomJournalEntry['lineItems'][number],
  entryId: string,
  entryAt: Date,
): LedgerEntryLineItem => ({
  id: crypto.randomUUID(),
  entryId,
  account: resolveAccount(accountIdentifier),
  amount: Number(amount),
  direction,
  customer: null,
  vendor: null,
  entryAt,
  createdAt: entryAt,
  entryReversalOf: null,
  entryReversedBy: null,
})

export const journalEntryFromCreateRequest = (
  { entryAt, memo, referenceNumber, metadata, lineItems }: CreateCustomJournalEntry,
  base: LedgerEntry,
): LedgerEntry => ({
  ...base,
  entryType: EntryType.Manual,
  date: entryAt,
  entryAt,
  memo,
  referenceNumber: referenceNumber ?? null,
  metadata: metadata ?? null,
  lineItems: lineItems.map(line => toLineItem(line, base.id, entryAt)),
  source: makeManualEntrySource({ id: base.id, memo }),
})
