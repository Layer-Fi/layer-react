import type { BankAccount } from '@schemas/features/bankAccounts/bankAccount'
import { type ExternalAccountConnection } from '@schemas/features/bankAccounts/externalAccountConnection'

export type BankAccountLabelParts = {
  accountName: string
  mask: string | null
}

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

export function getBankAccountLabelParts(bankAccount: BankAccount): BankAccountLabelParts {
  return {
    accountName: getBankAccountDisplayName(bankAccount),
    mask: bankAccount.mask ?? bankAccount.externalAccounts[0]?.mask ?? null,
  }
}

export function isAllExternalAccountsUserCreatedCustom(bankAccount: BankAccount): boolean {
  return bankAccount.externalAccounts.length > 0
    && bankAccount.externalAccounts.every(ea => ea.externalAccountSource === 'CUSTOM' && ea.userCreated)
}
