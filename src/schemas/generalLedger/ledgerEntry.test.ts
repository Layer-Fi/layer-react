import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { EntryType, LedgerEntrySchema } from '@schemas/generalLedger/ledgerEntry'
import { decodeLedgerEntrySource } from '@schemas/generalLedger/ledgerEntrySource'

const CLOSING_ACTION_ENTRY = {
  id: '4b21c80b-c0d1-4485-ae52-683627e44616',
  business_id: '9e303df5-0225-46d6-8674-ef6c03322210',
  ledger_id: '1ec70282-ca1e-4862-a076-55b6c5031127',
  agent: 'API',
  entry_type: 'CLOSING_ACTION_RECOGNIZE_EXTERNAL_REVENUE',
  customer: null,
  vendor: null,
  entry_number: 12755,
  date: '2026-07-07T18:21:07.371478Z',
  entry_at: '2026-07-01T03:59:59.999Z',
  reversal_of_id: null,
  reversal_id: null,
  line_items: [
    {
      id: '4b21c80b-c0d1-4485-ae52-683627e44616-1',
      entry_id: '4b21c80b-c0d1-4485-ae52-683627e44616',
      account: {
        id: '12f34872-50ea-4446-94d7-db129ce12b32',
        name: 'XPerience+ Clearing',
        account_number: '17140',
        stable_name: 'PAYMENT_PROCESSOR_CLEARING:XPerience+',
        normality: 'DEBIT',
        account_type: { value: 'ASSET', display_name: 'Assets' },
        account_subtype: {
          value: 'PAYMENT_PROCESSOR_CLEARING_ACCOUNT',
          display_name: 'Payment Clearing Accounts',
        },
      },
      amount: 69000,
      direction: 'DEBIT',
      customer: null,
      vendor: null,
      entry_at: '2026-07-01T03:59:59.999Z',
      createdAt: '2026-07-07T18:21:07.371478Z',
      entry_reversal_of: null,
      entry_reversed_by: null,
    },
  ],
  source: {
    type: 'Closing_Action_Ledger_Entry_Source',
    closing_action_id: 'd7009064-299e-43b1-acbe-3787540dd774',
    action_type: 'RECOGNIZE_EXTERNAL_REVENUE',
    closing_date: '2026-07-01',
    entity_name: 'Closing Entry',
    display_description: 'Closing Entry: RECOGNIZE_EXTERNAL_REVENUE',
    memo: null,
    metadata: null,
    reference_number: null,
  },
  transaction_tags: [],
  memo: null,
  metadata: null,
  reference_number: null,
}

const decodeEntry = Schema.decodeUnknownSync(LedgerEntrySchema)

describe('LedgerEntrySchema', () => {
  it('decodes a closing action entry', () => {
    const entry = decodeEntry(CLOSING_ACTION_ENTRY)

    expect(entry.entryType).toBe(EntryType.ClosingActionRecognizeExternalRevenue)
    expect(entry.lineItems).toHaveLength(1)
  })
})

describe('decodeLedgerEntrySource', () => {
  it('decodes a closing action source', () => {
    const source = decodeLedgerEntrySource(CLOSING_ACTION_ENTRY.source)

    expect(source).toMatchObject({
      type: 'Closing_Action_Ledger_Entry_Source',
      closingActionId: 'd7009064-299e-43b1-acbe-3787540dd774',
      actionType: 'RECOGNIZE_EXTERNAL_REVENUE',
      closingDate: '2026-07-01',
      entityName: 'Closing Entry',
    })
  })
})
