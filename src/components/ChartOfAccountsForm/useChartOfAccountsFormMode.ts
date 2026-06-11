import { useCallback, useContext, useState } from 'react'

import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { type ChartOfAccountsFormMode } from '@components/ChartOfAccountsForm/ChartOfAccountsForm'
import { flattenAccounts } from '@components/ChartOfAccountsForm/flattenAccounts'

export const useChartOfAccountsFormMode = () => {
  const { data } = useContext(ChartOfAccountsContext)
  const [formMode, setFormMode] = useState<ChartOfAccountsFormMode | undefined>()

  const addAccount = useCallback(() => setFormMode({ action: 'new' }), [])

  const editAccount = useCallback((accountId: string) => {
    // Only open the edit form for an account that's actually in the loaded data,
    // otherwise the form can't resolve it and the panel opens blank.
    const accountExists = flattenAccounts(data?.accounts ?? [])
      .some(account => account.accountId === accountId)

    if (!accountExists) {
      return
    }

    setFormMode({ action: 'edit', accountId })
  }, [data?.accounts])

  const cancelForm = useCallback(() => setFormMode(undefined), [])

  return { formMode, addAccount, editAccount, cancelForm }
}
