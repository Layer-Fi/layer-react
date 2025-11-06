import { useCallback, useEffect, useRef, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext/LayerContext'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { QuickbooksConnectionLastSyncStatus, type StatusOfQuickbooksConnection } from '../../types/quickbooks'
import { format } from 'date-fns'

type UseQuickbooks = () => {
  linkQuickbooks: () => Promise<string>
  unlinkQuickbooks: () => Promise<void>
  syncFromQuickbooks: () => void
  quickbooksConnectionStatus: StatusOfQuickbooksConnection | undefined
}

export const useQuickbooks: UseQuickbooks = () => {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [quickbooksConnectionStatus, setQuickbooksConnectionStatus] = useState<StatusOfQuickbooksConnection | undefined>(undefined)
  const isSyncingFromQuickbooks = quickbooksConnectionStatus?.is_syncing ?? false
  const syncStatusIntervalRef = useRef<number | null>(null)

  const fetchQuickbooksConnectionStatus = useCallback(async () => {
    const newQuickbooksConnectionStatus = (
      await Layer.statusOfQuickbooksConnection(apiUrl, auth?.access_token, {
        params: { businessId },
      })()
    ).data
    setQuickbooksConnectionStatus(newQuickbooksConnectionStatus)
  }, [apiUrl, auth?.access_token, businessId, setQuickbooksConnectionStatus])

  // Poll the server to determine when the Quickbooks sync is complete
  useEffect(() => {
    if (isSyncingFromQuickbooks && syncStatusIntervalRef.current === null) {
      const interval = window.setInterval(() => void fetchQuickbooksConnectionStatus(), 2000)
      syncStatusIntervalRef.current = interval
      return () => clearInterval(interval)
    }
    else if (!isSyncingFromQuickbooks && syncStatusIntervalRef.current) {
      clearInterval(syncStatusIntervalRef.current)
      syncStatusIntervalRef.current = null
    }
  }, [fetchQuickbooksConnectionStatus, isSyncingFromQuickbooks])

  // Determine whether there exists an active Quickbooks connection or not
  useEffect(() => {
    if (auth?.access_token) {
      void fetchQuickbooksConnectionStatus()
    }
  }, [auth?.access_token, fetchQuickbooksConnectionStatus])

  const handleSyncError = useCallback(() => {
    setQuickbooksConnectionStatus({
      is_connected: true,
      is_syncing: false,
      last_sync_status: QuickbooksConnectionLastSyncStatus.SYNC_FAILURE,
      last_synced_at: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss'),
    })
  }, [])

  const syncFromQuickbooks = useCallback(() => {
    const newQuickbooksConnectionStatus = quickbooksConnectionStatus
      ? { ...quickbooksConnectionStatus, is_syncing: true }
      : undefined
    setQuickbooksConnectionStatus(newQuickbooksConnectionStatus)

    void Layer.syncFromQuickbooks(apiUrl, auth?.access_token, {
      params: { businessId },
    }).catch(handleSyncError)
  }, [apiUrl, auth?.access_token, businessId, quickbooksConnectionStatus, handleSyncError])

  const linkQuickbooks = useCallback(async () => {
    return Layer.initQuickbooksOAuth(apiUrl, auth?.access_token, {
      params: { businessId },
    }).then(res => res.data.redirect_url)
  }, [apiUrl, auth?.access_token, businessId])

  const unlinkQuickbooks = useCallback(async () => {
    return Layer.unlinkQuickbooksConnection(apiUrl, auth?.access_token, {
      params: { businessId },
    })
      .then(() => fetchQuickbooksConnectionStatus())
  }, [apiUrl, auth?.access_token, businessId, fetchQuickbooksConnectionStatus])

  return {
    syncFromQuickbooks,
    linkQuickbooks,
    unlinkQuickbooks,
    quickbooksConnectionStatus,
  }
}
