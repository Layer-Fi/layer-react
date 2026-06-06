import type { BankAccount, ExternalAccountConnection } from '@schemas/bankAccounts/bankAccount'

export function getAccountsNeedingConfirmation(bankAccounts: ReadonlyArray<BankAccount>): ExternalAccountConnection[] {
  return bankAccounts.flatMap(ba =>
    ba.externalAccounts.filter(
      ({ notifications }) => notifications?.some(({ type }) => type === 'CONFIRM_RELEVANT'),
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

export function isAnyBankAccountSyncing(bankAccounts: ReadonlyArray<BankAccount>): boolean {
  return bankAccounts.some(isBankAccountSyncing)
}

export function isAllExternalAccountsUserCreatedCustom(bankAccount: BankAccount): boolean {
  return bankAccount.externalAccounts.length > 0
    && bankAccount.externalAccounts.every(ea => ea.externalAccountSource === 'CUSTOM' && ea.userCreated)
}
