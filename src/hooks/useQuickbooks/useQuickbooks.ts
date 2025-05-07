import { useCallback, useEffect, useRef, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import type { StatusOfQuickbooksConnection } from '../../types/quickbooks'

type UseQuickbooks = () => {
  linkQuickbooks: () => Promise<string>
  unlinkQuickbooks: () => void
  syncFromQuickbooks: () => void
  isSyncingFromQuickbooks: boolean
  quickbooksIsConnected: StatusOfQuickbooksConnection['is_connected'] | undefined
  quickbooksLastSyncedAt: StatusOfQuickbooksConnection['last_synced_at'] | undefined
}

export const useQuickbooks: UseQuickbooks = () => {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [isSyncingFromQuickbooks, setIsSyncingFromQuickbooks] = useState<boolean>(false)
  const [quickbooksConnectionStatus, setQuickbooksConnectionStatus] = useState<StatusOfQuickbooksConnection | undefined>(undefined)
  const syncStatusIntervalRef = useRef<number | null>(null)
  const wasSyncingFromQuickbooksRef = useRef<boolean>(false)

  const fetchQuickbooksConnectionStatus = useCallback(async () => {
    const newQuickbooksConnectionStatus = (
      await Layer.statusOfQuickbooksConnection(apiUrl, auth?.access_token, {
        params: { businessId },
      })()
    ).data
    setQuickbooksConnectionStatus(newQuickbooksConnectionStatus)
  }, [apiUrl, auth?.access_token, businessId, setQuickbooksConnectionStatus])

  const fetchIsSyncingFromQuickbooks = useCallback(async () => {
    const isSyncing = (
      await Layer.statusOfSyncFromQuickbooks(apiUrl, auth?.access_token, {
        params: { businessId },
      })()
    ).data.is_syncing
    const wasSyncing = wasSyncingFromQuickbooksRef.current
    
    wasSyncingFromQuickbooksRef.current = isSyncing
    setIsSyncingFromQuickbooks(isSyncing)

    // If we completed the sync, fetch a fresh Quickbooks connection status
    if (!isSyncing && wasSyncing) {
      await fetchQuickbooksConnectionStatus()
    }
  }, [apiUrl, auth?.access_token, businessId, setIsSyncingFromQuickbooks, fetchQuickbooksConnectionStatus])

  // Poll the server to determine when the Quickbooks sync is complete
  useEffect(() => {
    if (isSyncingFromQuickbooks && syncStatusIntervalRef.current === null) {
      const interval = window.setInterval(() => void fetchIsSyncingFromQuickbooks(), 2000)
      syncStatusIntervalRef.current = interval
      return () => clearInterval(interval)
    }
    else if (!isSyncingFromQuickbooks && syncStatusIntervalRef.current) {
      clearInterval(syncStatusIntervalRef.current)
      syncStatusIntervalRef.current = null
    }
  }, [fetchIsSyncingFromQuickbooks, isSyncingFromQuickbooks])

  // Determine whether there exists an active Quickbooks connection or not
  useEffect(() => {
    if (auth?.access_token) {
      void fetchQuickbooksConnectionStatus()
    }
  }, [auth?.access_token, fetchQuickbooksConnectionStatus])

  const syncFromQuickbooks = () => {
    setIsSyncingFromQuickbooks(true)

    void Layer.syncFromQuickbooks(apiUrl, auth?.access_token, {
      params: { businessId },
    })
      .finally(() => setIsSyncingFromQuickbooks(false))
  }

  const linkQuickbooks = useCallback(async () => {
    const res = await Layer.initQuickbooksOAuth(apiUrl, auth?.access_token, {
      params: { businessId },
    })

    return res.data.redirect_url
  }, [apiUrl, auth?.access_token, businessId])

  const unlinkQuickbooks = useCallback(() => {
    void Layer.unlinkQuickbooksConnection(apiUrl, auth?.access_token, {
      params: { businessId },
    })
      .then(() => fetchQuickbooksConnectionStatus())
  }, [apiUrl, auth?.access_token, businessId, fetchQuickbooksConnectionStatus])

  return {
    isSyncingFromQuickbooks,
    syncFromQuickbooks,
    quickbooksIsConnected: quickbooksConnectionStatus?.is_connected,
    quickbooksLastSyncedAt: quickbooksConnectionStatus?.last_synced_at,
    linkQuickbooks,
    unlinkQuickbooks,
  }
}
