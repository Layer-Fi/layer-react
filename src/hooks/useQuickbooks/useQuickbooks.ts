import { useEffect, useRef, useState } from 'react'
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSyncingFromQuickbooks])

  // Determine whether there exists an active Quickbooks connection or not
  useEffect(() => {
    if (auth?.access_token) {
      void fetchQuickbooksConnectionStatus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.access_token])

  const fetchQuickbooksConnectionStatus = async () => {
    const newQuickbooksConnectionStatus = (
      await Layer.statusOfQuickbooksConnection(apiUrl, auth?.access_token, {
        params: { businessId },
      })()
    ).data
    setQuickbooksConnectionStatus(newQuickbooksConnectionStatus)
  }

  const syncFromQuickbooks = () => {
    setIsSyncingFromQuickbooks(true)

    void Layer.syncFromQuickbooks(apiUrl, auth?.access_token, {
      params: { businessId },
    })
      .finally(() => setIsSyncingFromQuickbooks(false))
  }

  const fetchIsSyncingFromQuickbooks = async () => {
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

  const unlinkQuickbooks = () => {
    void Layer.unlinkQuickbooksConnection(apiUrl, auth?.access_token, {
      params: { businessId },
    })
      .then(() => fetchQuickbooksConnectionStatus())
  }

  return {
    isSyncingFromQuickbooks,
    syncFromQuickbooks,
    quickbooksIsConnected: quickbooksConnectionStatus?.is_connected,
    quickbooksLastSyncedAt: quickbooksConnectionStatus?.last_synced_at,
    linkQuickbooks,
    unlinkQuickbooks,
  }
}
