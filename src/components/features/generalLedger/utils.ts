import type { NestedLedgerAccountType } from '@schemas/features/generalLedger/ledgerBalances'

export const flattenAccounts = (
  accounts: readonly NestedLedgerAccountType[],
): NestedLedgerAccountType[] => accounts
  .flatMap(account => [account, ...flattenAccounts(account.subAccounts || [])])
