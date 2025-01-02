import { useEffect, useRef, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'

type UseQuickbooks = () => {
  linkQuickbooks: () => Promise<string>
  unlinkQuickbooks: () => void
  syncFromQuickbooks: () => void
  isSyncingFromQuickbooks: boolean
  quickbooksIsLinked: boolean | null
}

const DEBUG = true

export const useQuickbooks: UseQuickbooks = () => {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [isSyncingFromQuickbooks, setIsSyncingFromQuickbooks] =
    useState<boolean>(false)
  const [quickbooksIsLinked, setQuickbooksIsLinked] = useState<boolean | null>(
    null,
  )
  const syncStatusIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Poll the server to determine when the Quickbooks sync is complete
  useEffect(() => {
    if (isSyncingFromQuickbooks && syncStatusIntervalRef.current === null) {
      const interval = setInterval(() => fetchIsSyncingFromQuickbooks(), 2000)
      syncStatusIntervalRef.current = interval
      return () => clearInterval(interval)
    }
    else if (!isSyncingFromQuickbooks && syncStatusIntervalRef.current) {
      clearInterval(syncStatusIntervalRef.current)
      syncStatusIntervalRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSyncingFromQuickbooks])

  // Determine whether there exists an active Quickbooks connection or not
  useEffect(() => {
    if (auth?.access_token) {
      fetchQuickbooksConnectionStatus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.access_token])

  const fetchQuickbooksConnectionStatus = async () => {
    const isConnected = (
      await Layer.statusOfQuickbooksConnection(apiUrl, auth?.access_token, {
        params: { businessId },
      })()
    ).data.is_connected
    setQuickbooksIsLinked(isConnected)
  }

  const syncFromQuickbooks = () => {
    if (DEBUG) {
      console.debug('Triggering sync from Quickbooks...')
    }

    setIsSyncingFromQuickbooks(true)
    try {
      Layer.syncFromQuickbooks(apiUrl, auth?.access_token, {
        params: { businessId },
      })
    }
    catch {
      setIsSyncingFromQuickbooks(false)
    }
  }

  const fetchIsSyncingFromQuickbooks = async () => {
    if (DEBUG) {
      console.debug('Fetching status of sync from Quickbooks...')
    }

    const isSyncing = (
      await Layer.statusOfSyncFromQuickbooks(apiUrl, auth?.access_token, {
        params: { businessId },
      })()
    ).data.is_syncing
    setIsSyncingFromQuickbooks(isSyncing)
  }

  const linkQuickbooks = async () => {
    const res = await Layer.initQuickbooksOAuth(apiUrl, auth?.access_token, {
      params: { businessId },
    })

    return res.data.redirect_url
  }

  const unlinkQuickbooks = async () => {
    await Layer.unlinkQuickbooksConnection(apiUrl, auth?.access_token, {
      params: { businessId },
    })
    fetchQuickbooksConnectionStatus()
  }

  return {
    isSyncingFromQuickbooks,
    syncFromQuickbooks,
    quickbooksIsLinked,
    linkQuickbooks,
    unlinkQuickbooks,
  }
}
