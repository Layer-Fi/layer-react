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

export const useQuickbooks: UseQuickbooks = () => {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [isSyncingFromQuickbooks, setIsSyncingFromQuickbooks] =
    useState<boolean>(false)
  const [quickbooksIsLinked, setQuickbooksIsLinked] = useState<boolean | null>(
    null,
  )
  const syncStatusIntervalRef = useRef<number | null>(null)

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
  }, [isSyncingFromQuickbooks])

  // Determine whether there exists an active Quickbooks connection or not
  useEffect(() => {
    if (auth?.access_token) {
      void fetchQuickbooksConnectionStatus()
    }
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
    quickbooksIsLinked,
    linkQuickbooks,
    unlinkQuickbooks,
  }
}
