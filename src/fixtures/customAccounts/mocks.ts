import {
  type CustomAccount,
  CustomAccountClassification,
  CustomAccountSubtype,
  CustomAccountType,
} from '@schemas/customAccounts'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseCustomAccount: CustomAccount = {
  id: '00000000-0000-4000-8000-000000000001',
  externalId: null,
  mask: '0000',
  accountName: 'Primary Checking',
  institutionName: 'Chase',
  accountType: CustomAccountType.DEPOSITORY,
  accountSubtype: CustomAccountSubtype.CHECKING,
  customAccountType: CustomAccountClassification.DEFAULT,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  archivedAt: null,
  ledgerAccountId: '00000000-0000-4000-8000-000000000002',
  userCreated: true,
}

export const { make: makeCustomAccount, makeMany: makeCustomAccounts } =
  createFixtureFactory(baseCustomAccount)

// Parses cleanly through the parse-csv mock: negative amounts are outflows
// (debits), positive are inflows (credits).
const sampleTransactionsCsvRows = [
  ['date', 'description', 'amount', 'reference_number'],
  ['2025-06-02', 'Home Depot - lumber and fasteners', '-482.13', 'HD-88671'],
  ['2025-06-03', 'Ferguson Plumbing - fixtures', '-1250.00', 'FP-20314'],
  ['2025-06-05', 'Client payment - Smith kitchen remodel', '4500.00', 'CHK-1041'],
  ['2025-06-09', 'Sunbelt Rentals - excavator day rate', '-389.50', 'SR-55210'],
  ['2025-06-12', 'Client payment - Greenway HOA landscaping', '2200.00', 'ACH-77120'],
]

export const sampleTransactionsCsv = sampleTransactionsCsvRows.map(row => row.join(',')).join('\n')

export const makeSampleTransactionsCsvFile = () =>
  new File([sampleTransactionsCsv], 'transactions.csv', { type: 'text/csv' })
