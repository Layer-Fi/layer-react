import { useCallback, useContext, useMemo, useState } from 'react'

import { useIsMountedRef } from '@hooks/utils/react/useIsMountedRef'
import { LinkedAccountsContext } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'

type ConnectAccountStatus = 'idle' | 'connecting' | 'connected'

/** A connection already made is reused, so a caller retrying its own follow-up work doesn't reopen Plaid. */
export const useConnectAccount = () => {
  const { addConnection } = useContext(LinkedAccountsContext)
  const [status, setStatus] = useState<ConnectAccountStatus>('idle')
  const isMountedRef = useIsMountedRef()

  const connect = useCallback(async () => {
    if (status === 'connected') return true

    setStatus('connecting')
    const isConnected = await addConnection('PLAID')
    // The caller can leave the page while Link is open (Back, Skip, or the task refetched away), so a
    // connection that lands after that is reported as not connected rather than continuing a page nobody is on.
    const isConnectedWhileMounted = isConnected && isMountedRef.current
    setStatus(isConnectedWhileMounted ? 'connected' : 'idle')

    return isConnectedWhileMounted
  }, [addConnection, status, isMountedRef])

  return useMemo(() => ({ isConnecting: status === 'connecting', connect }), [status, connect])
}
