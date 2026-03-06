import type { BankAccount } from '@internal-types/linkedAccounts'

export function getBankAccountDisplayName(bankAccount: BankAccount): string {
  return bankAccount.account_name
    ?? bankAccount.external_accounts[0]?.external_account_name
    ?? 'Unknown Account'
}

export function getBankAccountInstitution(bankAccount: BankAccount): { name: string, logo: string | null } | null {
  return bankAccount.institution
    ?? bankAccount.external_accounts[0]?.institution
    ?? null
}

export function isBankAccountSyncing(bankAccount: BankAccount): boolean {
  return bankAccount.external_accounts.some(ea => ea.is_syncing)
}

export function isAnyBankAccountSyncing(bankAccounts: ReadonlyArray<BankAccount>): boolean {
  return bankAccounts.some(isBankAccountSyncing)
}

export function isAllExternalAccountsUserCreatedCustom(bankAccount: BankAccount): boolean {
  return bankAccount.external_accounts.length > 0
    && bankAccount.external_accounts.every(ea => ea.external_account_source === 'CUSTOM' && ea.user_created)
}
