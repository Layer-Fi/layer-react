import { useCallback, useContext, useMemo, useState } from 'react'

import { useIsMountedRef } from '@hooks/utils/react/useIsMountedRef'
import { useConnectedAccountKeys } from '@providers/features/linkedAccounts/LinkedAccounts/ConnectedAccountKeys'
import { LinkedAccountsContext } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'

/** A connection already made is reused, so a caller retrying its own follow-up work doesn't reopen Plaid. */
export const useConnectAccount = (connectionKey: string) => {
  const { addConnection } = useContext(LinkedAccountsContext)
  const sharedConnectedKeys = useConnectedAccountKeys()
  const [localConnectedKeys] = useState(() => new Set<string>())
  const connectedKeys = sharedConnectedKeys ?? localConnectedKeys
  const [isConnecting, setIsConnecting] = useState(false)
  const isMountedRef = useIsMountedRef()

  const connect = useCallback(async () => {
    if (connectedKeys.has(connectionKey)) return true

    setIsConnecting(true)
    const isConnected = await addConnection('PLAID')
    if (isConnected) connectedKeys.add(connectionKey)
    if (!isMountedRef.current) {
      // The caller can leave the page while Link is open (Back, Skip, or the task refetched away), so a
      // connection that lands after that is reported as not connected rather than continuing a page nobody is on.
      return false
    }

    setIsConnecting(false)
    return isConnected
  }, [addConnection, connectedKeys, connectionKey, isMountedRef])

  return useMemo(() => ({ isConnecting, connect }), [isConnecting, connect])
}
