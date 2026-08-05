import { describe, expect, it } from 'vitest'

import { decodeLedgerEntrySource } from '@schemas/features/generalLedger/ledgerEntrySource'

describe('LedgerEntrySource', () => {
  it('decodes a transaction source', () => {
    expect(decodeLedgerEntrySource({
      type: 'Transaction_Ledger_Entry_Source',
      transaction_id: 'abc',
      display_description: 'Coffee',
      entity_name: 'Transaction',
      external_id: 'ext-1',
      account_name: 'Checking',
      date: '2026-01-01',
      amount: 500,
      direction: 'CREDIT',
      counterparty: 'Blue Bottle',
      description: 'card swipe',
      memo: null,
      metadata: null,
      reference_number: null,
    })).toMatchObject({ type: 'Transaction_Ledger_Entry_Source', displayDescription: 'Coffee', externalId: 'ext-1' })
  })

  it('decodes a manual source with the optional base keys omitted', () => {
    expect(decodeLedgerEntrySource({
      type: 'Manual_Ledger_Entry_Source',
      manual_entry_id: 'me-1',
      created_by: 'sarah',
      display_description: 'Adjustment',
      entity_name: 'Manual',
    })).toMatchObject({ type: 'Manual_Ledger_Entry_Source', createdBy: 'sarah' })
  })

  it('returns null for an unknown discriminator', () => {
    expect(decodeLedgerEntrySource({ type: 'Nope', display_description: 'x', entity_name: 'y' })).toBeNull()
  })
})
