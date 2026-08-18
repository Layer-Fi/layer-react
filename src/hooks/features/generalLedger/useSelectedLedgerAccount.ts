import { useMemo } from 'react'

import { findAccountById, getLedgerAccountNodeType } from '@utils/features/generalLedger/chartOfAccounts'
import { useSelectedLedgerAccountId } from '@providers/features/generalLedger/ChartOfAccountsSelectionStore/ChartOfAccountsSelectionStoreProvider'
import { useChartOfAccountsBalances } from '@hooks/features/generalLedger/useChartOfAccountsBalances'

export const useSelectedLedgerAccount = ({ filterByDateRange }: { filterByDateRange?: boolean } = {}) => {
  const selectedAccountId = useSelectedLedgerAccountId()
  const { data } = useChartOfAccountsBalances({ filterByDateRange })

  return useMemo(() => {
    const accounts = data?.accounts ?? []
    const account = selectedAccountId ? findAccountById(accounts, selectedAccountId) : undefined

    if (!account) return undefined

    return { ...account, nodeType: getLedgerAccountNodeType(accounts, account) }
  }, [data?.accounts, selectedAccountId])
}
