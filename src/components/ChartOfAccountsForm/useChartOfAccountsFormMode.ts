import { useCallback, useState } from 'react'

import { type ChartOfAccountsFormMode } from '@components/ChartOfAccountsForm/ChartOfAccountsForm'

export const useChartOfAccountsFormMode = () => {
  const [formMode, setFormMode] = useState<ChartOfAccountsFormMode | undefined>()

  const addAccount = useCallback(() => setFormMode({ action: 'new' }), [])
  const editAccount = useCallback((accountId: string) => setFormMode({ action: 'edit', accountId }), [])
  const cancelForm = useCallback(() => setFormMode(undefined), [])

  return { formMode, addAccount, editAccount, cancelForm }
}
