import { LedgerAccountNodeType } from '@internal-types/features/generalLedger/chartOfAccounts'
import type { NestedLedgerAccountType } from '@schemas/features/generalLedger/ledgerBalances'

export const flattenAccounts = (
  accounts: readonly NestedLedgerAccountType[],
): NestedLedgerAccountType[] => accounts
  .flatMap(account => [account, ...flattenAccounts(account.subAccounts || [])])

export const findAccountById = (
  accounts: readonly NestedLedgerAccountType[],
  accountId: string,
) => flattenAccounts(accounts).find(account => account.accountId === accountId)

export const getLedgerAccountNodeType = (
  accounts: readonly NestedLedgerAccountType[],
  account: NestedLedgerAccountType,
): LedgerAccountNodeType => {
  if (accounts.some(root => root.accountId === account.accountId)) {
    return LedgerAccountNodeType.Root
  }

  return account.subAccounts.length > 0
    ? LedgerAccountNodeType.Parent
    : LedgerAccountNodeType.Leaf
}
