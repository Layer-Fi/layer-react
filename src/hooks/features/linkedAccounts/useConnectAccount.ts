import { useCallback, useContext, useMemo, useState } from 'react'

import { useIsMountedRef } from '@hooks/utils/react/useIsMountedRef'
import { LinkedAccountsContext } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'

export const useConnectAccount = () => {
  const { addConnection } = useContext(LinkedAccountsContext)
  const [isConnecting, setIsConnecting] = useState(false)
  const isMountedRef = useIsMountedRef()

  const connect = useCallback(async () => {
    setIsConnecting(true)
    const isConnected = await addConnection('PLAID')
    // The caller can leave the page while Link is open (Back, Skip, or the task refetched away), so a
    // connection that lands after that is reported as not connected rather than continuing a page nobody is on.
    if (!isMountedRef.current) return false

    setIsConnecting(false)
    return isConnected
  }, [addConnection, isMountedRef])

  return useMemo(() => ({ isConnecting, connect }), [isConnecting, connect])
}
