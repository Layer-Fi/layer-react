import { LedgerAccountType, LedgerEntryDirection, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseChartAccount: SingleChartAccountType = {
  accountId: '00000000-0000-4000-8000-000000000801',
  name: 'Cash',
  stableName: 'CASH',
  accountNumber: null,
  normality: LedgerEntryDirection.Debit,
  accountType: { value: LedgerAccountType.Asset, displayName: 'Assets' },
  accountSubtype: { value: 'CASH', displayName: 'Cash' },
}

export const { make: makeChartAccount, makeMany: makeChartAccounts } =
  createFixtureFactory(baseChartAccount)
