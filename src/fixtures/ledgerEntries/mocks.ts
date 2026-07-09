import { LedgerAccountType, LedgerEntryDirection, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { ClassifierAgent, EntryType, type LedgerEntry, type LedgerEntryLineItem } from '@schemas/generalLedger/ledgerEntry'

import { makeBusiness } from '@fixtures/business/mocks'
import { makeChartAccount } from '@fixtures/chartOfAccounts/mocks'
import { makeManualEntrySource } from '@fixtures/ledgerEntries/sources'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const cashAccount = makeChartAccount()
const salesAccount = makeChartAccount({
  accountId: '00000000-0000-4000-8000-000000000802',
  name: 'Sales',
  stableName: 'SALES',
  accountType: { value: LedgerAccountType.Revenue, displayName: 'Revenue' },
  accountSubtype: { value: 'SALES', displayName: 'Sales' },
  normality: LedgerEntryDirection.Credit,
})

const ENTRY_ID = '00000000-0000-4000-8000-000000000901'
const ENTRY_AT = new Date('2025-06-01T12:00:00.000Z')
const MEMO = 'Client invoice payment'

const baseLineItem = (
  id: string,
  account: SingleChartAccountType,
  direction: LedgerEntryDirection,
): LedgerEntryLineItem => ({
  id,
  entryId: ENTRY_ID,
  account,
  amount: 50000,
  direction,
  customer: null,
  vendor: null,
  entryAt: ENTRY_AT,
  createdAt: ENTRY_AT,
  entryReversalOf: null,
  entryReversedBy: null,
})

const baseLedgerEntry: LedgerEntry = {
  id: ENTRY_ID,
  businessId: makeBusiness().id,
  ledgerId: '00000000-0000-4000-8000-0000000000ff',
  entryNumber: 1001,
  agent: ClassifierAgent.LayerManual,
  entryType: EntryType.Manual,
  customer: null,
  vendor: null,
  date: ENTRY_AT,
  entryAt: ENTRY_AT,
  reversalOfId: null,
  reversalId: null,
  lineItems: [
    baseLineItem('00000000-0000-4000-8000-000000000902', cashAccount, LedgerEntryDirection.Debit),
    baseLineItem('00000000-0000-4000-8000-000000000903', salesAccount, LedgerEntryDirection.Credit),
  ],
  source: makeManualEntrySource({ id: ENTRY_ID, memo: MEMO }),
  transactionTags: [],
  memo: MEMO,
  metadata: null,
  referenceNumber: null,
}

export const { make: makeLedgerEntry, makeMany: makeLedgerEntries } =
  createFixtureFactory(baseLedgerEntry)
