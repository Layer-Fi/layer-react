import { type BankAccount } from '@schemas/bankAccounts/bankAccount'
import { type ExternalAccountConnection } from '@schemas/bankAccounts/externalAccountConnection'

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

type MirroredBankAccountOptions = {
  id: string
  externalAccountId: string
  name: string
  institution: string
  mask: string
  balance: number
  externalAccountOverrides?: Partial<ExternalAccountConnection>
}

/**
 * A bank account whose display details (name, institution, mask) are mirrored
 * into its single external connection - the usual shape for a freshly linked
 * Plaid account, where the connection is the source of those details.
 */
export function makeBankAccountWithMirroredExternalAccount({
  id,
  externalAccountId,
  name,
  institution,
  mask,
  balance,
  externalAccountOverrides,
}: MirroredBankAccountOptions): BankAccount {
  const mirroredInstitution = { name: institution, logo: null }

  return makeBankAccount({
    id,
    accountName: name,
    institution: mirroredInstitution,
    notifyWhenDisconnected: false,
    mask,
    latestBalanceTimestamp: { balance },
    currentLedgerBalance: balance,
    externalAccounts: [
      {
        id: externalAccountId,
        externalAccountSource: 'PLAID',
        externalAccountName: name,
        mask,
        institution: mirroredInstitution,
        notifications: [],
        connectionNeedsRepairAsOf: null,
        reconnectWithNewCredentials: false,
        connectionExternalId: null,
        userCreated: false,
        isSyncing: false,
        ...externalAccountOverrides,
      },
    ],
  })
}

/**
 * A bank account whose single external connection carries a `CONFIRM_RELEVANT`
 * notification - see `markAccountNeedingConfirmation`.
 */
export function makeAccountNeedingConfirmation(
  options: Omit<MirroredBankAccountOptions, 'externalAccountOverrides'>,
): BankAccount {
  return markAccountNeedingConfirmation(makeBankAccountWithMirroredExternalAccount(options))
}

/**
 * Flags every external connection on the account with the `CONFIRM_RELEVANT`
 * notification - the flag `getAccountsNeedingConfirmation` looks for to surface
 * the "which accounts do you use for your business?" confirm/exclude step.
 */
export function markAccountNeedingConfirmation(account: BankAccount): BankAccount {
  return {
    ...account,
    externalAccounts: account.externalAccounts.map(externalAccount => ({
      ...externalAccount,
      notifications: [
        ...externalAccount.notifications.filter(({ type }) => type !== 'CONFIRM_RELEVANT'),
        { type: 'CONFIRM_RELEVANT' },
      ],
    })),
  }
}
