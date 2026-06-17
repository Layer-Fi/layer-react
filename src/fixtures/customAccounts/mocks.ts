import {
  type CustomAccount,
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
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  archivedAt: null,
  ledgerAccountId: '00000000-0000-4000-8000-000000000002',
  userCreated: true,
}

export const { make: makeCustomAccount, makeMany: makeCustomAccounts } =
  createFixtureFactory(baseCustomAccount)
