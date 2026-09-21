import type { BankAccount } from '@schemas/features/bankAccounts/bankAccount'

export function isBankAccountSyncing(bankAccount: BankAccount): boolean {
  return bankAccount.externalAccounts.some(ea => ea.isSyncing)
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
