import { useCallback, useState } from 'react'

import { findAccountById } from '@utils/features/generalLedger/chartOfAccounts'
import { useChartOfAccountsBalances } from '@hooks/features/generalLedger/useChartOfAccountsBalances'
import { type ChartOfAccountsFormMode } from '@features/generalLedger/ChartOfAccountsForm/ChartOfAccountsForm'

export const useChartOfAccountsFormMode = ({ filterByDateRange }: { filterByDateRange?: boolean } = {}) => {
  const { data } = useChartOfAccountsBalances({ filterByDateRange })
  const [formMode, setFormMode] = useState<ChartOfAccountsFormMode | undefined>()

  const addAccount = useCallback(() => setFormMode({ action: 'new' }), [])

  const editAccount = useCallback((accountId: string) => {
    // Only open the edit form for an account that's actually in the loaded data,
    // otherwise the form can't resolve it and the panel opens blank.
    if (!findAccountById(data?.accounts ?? [], accountId)) {
      return
    }

    setFormMode({ action: 'edit', accountId })
  }, [data?.accounts])

  const cancelForm = useCallback(() => setFormMode(undefined), [])

  return { formMode, addAccount, editAccount, cancelForm }
}
