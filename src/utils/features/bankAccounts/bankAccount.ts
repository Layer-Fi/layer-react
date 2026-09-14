import type { BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import type { ExternalAccountConnection } from '@schemas/features/bankAccounts/externalAccountConnection'

export function getAccountsNeedingConfirmation(bankAccounts: ReadonlyArray<BankAccount>): ExternalAccountConnection[] {
  return bankAccounts.flatMap(ba =>
    ba.externalAccounts.filter(
      ({ notifications }) => notifications.some(({ type }) => type === 'CONFIRM_RELEVANT'),
    ),
  )
}

export function getBankAccountDisplayName(bankAccount: BankAccount): string {
  return bankAccount.accountName
    ?? bankAccount.externalAccounts[0]?.externalAccountName
    ?? 'Unknown Account'
}

export function getBankAccountInstitution(bankAccount: BankAccount): { name: string, logo: string | null | undefined } | null {
  return bankAccount.institution
    ?? bankAccount.externalAccounts[0]?.institution
    ?? null
}

export function isBankAccountSyncing(bankAccount: BankAccount): boolean {
  return bankAccount.externalAccounts.some(ea => ea.isSyncing)
}

export function isBankAccountReadyForRefresh(bankAccount: BankAccount): boolean {
  return bankAccount.externalAccounts.some(
    externalAccount => externalAccount.notifications.some(({ type }) => type === 'READY_FOR_REFRESH'),
  )
}

export function getBankAccountsReadyForRefresh(
  bankAccounts: ReadonlyArray<BankAccount> | undefined,
): BankAccount[] {
  return (bankAccounts ?? []).filter(isBankAccountReadyForRefresh)
}

export function getBankAccountRefreshConnectionInfo(bankAccount: BankAccount) {
  if (!isBankAccountReadyForRefresh(bankAccount)) return null

  const refreshAccount = bankAccount.externalAccounts.find(
    externalAccount => externalAccount.notifications.some(({ type }) => type === 'READY_FOR_REFRESH'),
  )
  if (!refreshAccount) return null

  return {
    connectionExternalId: refreshAccount.connectionExternalId,
    source: refreshAccount.externalAccountSource,
    reconnectWithNewCredentials: refreshAccount.reconnectWithNewCredentials,
  }
}

export function formatBankAccountWithMask(bankAccount: BankAccount): string {
  const accountName = getBankAccountDisplayName(bankAccount)
  const mask = bankAccount.mask ?? bankAccount.externalAccounts[0]?.mask

  return mask ? `${accountName} (${mask})` : accountName
}

export function isAnyBankAccountSyncing(bankAccounts: ReadonlyArray<BankAccount>): boolean {
  return bankAccounts.some(isBankAccountSyncing)
}

export function getSyncingExternalAccountIds(bankAccounts: ReadonlyArray<BankAccount> | undefined): Set<string> {
  const ids = new Set<string>()

  for (const account of bankAccounts ?? []) {
    for (const external of account.externalAccounts) {
      if (external.isSyncing) ids.add(external.id)
    }
  }

  return ids
}

export function hasNewSyncingAccounts(
  prevAccounts: ReadonlyArray<BankAccount> | undefined,
  newAccounts: ReadonlyArray<BankAccount> | undefined,
): boolean {
  const prevIds = getSyncingExternalAccountIds(prevAccounts)
  const newIds = getSyncingExternalAccountIds(newAccounts)

  for (const id of newIds) {
    if (!prevIds.has(id)) return true
  }

  return false
}

export function isAllExternalAccountsUserCreatedCustom(bankAccount: BankAccount): boolean {
  return bankAccount.externalAccounts.length > 0
    && bankAccount.externalAccounts.every(ea => ea.externalAccountSource === 'CUSTOM' && ea.userCreated)
}
