import { type BankAccount } from '@schemas/bankAccounts/bankAccount'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseBankAccount: BankAccount = {
  id: '00000000-0000-4000-8000-000000000101',
  accountName: 'Chase Business Complete Checking',
  institution: {
    name: 'Chase',
    logo: null,
  },
  notifyWhenDisconnected: true,
  isDisconnected: false,
  externalAccounts: [
    {
      id: '00000000-0000-4000-8000-000000000102',
      externalAccountSource: 'PLAID',
      externalAccountName: 'Chase Business Complete Checking',
      mask: '4821',
      institution: {
        name: 'Chase',
        logo: null,
      },
      notifications: [],
      connectionNeedsRepairAsOf: null,
      reconnectWithNewCredentials: false,
      connectionExternalId: 'plaid_connection_4821',
      userCreated: false,
      isSyncing: false,
    },
  ],
  latestBalanceTimestamp: {
    balance: 1284500,
  },
  currentLedgerBalance: 1278900,
  mask: '4821',
  notifications: [],
}

export const { make: makeBankAccount, makeMany: makeBankAccounts } =
  createFixtureFactory(baseBankAccount)
