import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { LinkedAccountsContext } from '@providers/features/linkedAccounts/LinkedAccounts/LinkedAccountsContext'

type ConnectAccountStatus = 'idle' | 'connecting' | 'connected'

/**
 * Opens Plaid and resolves whether an account was connected. A connection already made is
 * reused, so a caller retrying its own follow-up work doesn't reopen Plaid. A connection that
 * lands after the caller unmounted resolves false, so it can't continue a page the user left.
 */
export const useConnectAccount = () => {
  const { addConnection } = useContext(LinkedAccountsContext)
  const [status, setStatus] = useState<ConnectAccountStatus>('idle')
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const connect = useCallback(async () => {
    if (status === 'connected') return true

    setStatus('connecting')
    const isConnected = await addConnection('PLAID')
    const continues = isConnected && isMountedRef.current
    setStatus(continues ? 'connected' : 'idle')

    return continues
  }, [addConnection, status])

  return useMemo(() => ({ isConnecting: status === 'connecting', connect }), [status, connect])
}
