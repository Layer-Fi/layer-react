import { bankAccounts } from '@fixtures/generated/bankAccounts.gen'

type BankAccountFixture = (typeof bankAccounts)[number]

// Fixed so disconnected stories stay visually stable across snapshots.
const DISCONNECTED_AS_OF = new Date('2024-03-14T12:00:00.000Z')

/*
 * A broken connection is backend state, not a prop: the "Fix account" pill
 * appears when an external account has `connectionNeedsRepairAsOf` set, and the
 * repair action is a no-op without a connection id to repair.
 */
const withBrokenPlaidConnection = (account: BankAccountFixture): BankAccountFixture => ({
  ...account,
  isDisconnected: true,
  externalAccounts: account.externalAccounts.map(externalAccount =>
    externalAccount.externalAccountSource === 'PLAID'
      ? {
        ...externalAccount,
        connectionNeedsRepairAsOf: DISCONNECTED_AS_OF,
        lastSyncedAt: externalAccount.lastSyncedAt ?? DISCONNECTED_AS_OF,
        connectionExternalId: externalAccount.connectionExternalId ?? 'plaid_item_story_disconnected',
      }
      : externalAccount,
  ),
})

export const disconnectedBankAccounts = bankAccounts
  .slice(0, 2)
  .map((account, index) => index === 0 ? withBrokenPlaidConnection(account) : account)

export const DISCONNECTED_ACCOUNTS_SCENARIOS = ['One account', 'Several accounts at one bank', 'Accounts at several banks'] as const

export type DisconnectedAccountsScenario = typeof DISCONNECTED_ACCOUNTS_SCENARIOS[number]

// Fixture order is Chase, Wells Fargo, Capital One, Capital One, Bank of America.
const DISCONNECTED_ACCOUNT_INDEXES: Record<DisconnectedAccountsScenario, ReadonlyArray<number>> = {
  'One account': [0],
  'Several accounts at one bank': [2, 3],
  'Accounts at several banks': [0, 2, 3],
}

export const getDisconnectedBankAccounts = (scenario: DisconnectedAccountsScenario) =>
  bankAccounts.map((account, index) =>
    DISCONNECTED_ACCOUNT_INDEXES[scenario].includes(index) ? withBrokenPlaidConnection(account) : account,
  )
