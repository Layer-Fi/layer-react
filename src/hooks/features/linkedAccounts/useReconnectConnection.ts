import { useCallback, useContext } from 'react'

import { type RefreshConnectionIdentity } from '@utils/features/bankAccounts/refresh'
import { LinkedAccountsContext } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'

export function useReconnectConnection() {
  const { addConnection, repairConnection } = useContext(LinkedAccountsContext)

  return useCallback(({ source, connectionExternalId, reconnectWithNewCredentials }: RefreshConnectionIdentity) => {
    if (reconnectWithNewCredentials) {
      void addConnection(source)
      return
    }

    void repairConnection(source, connectionExternalId)
  }, [addConnection, repairConnection])
}
