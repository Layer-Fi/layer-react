import type { NestedLedgerAccountType } from '@schemas/generalLedger/ledgerAccount'

export const flattenAccounts = (
  accounts: readonly NestedLedgerAccountType[],
): NestedLedgerAccountType[] => accounts
  .flatMap(account => [account, flattenAccounts(account.subAccounts || [])])
  .flat()
  .filter(account => account)
