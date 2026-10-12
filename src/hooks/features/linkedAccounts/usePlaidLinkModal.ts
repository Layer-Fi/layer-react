import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link'

import type { Awaitable } from '@internal-types/utility/awaitable'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { useEnvironment } from '@providers/global/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useLatestRef } from '@hooks/utils/react/useLatestRef'
import { usePostUpdateConnectionStatus } from '@api/businesses/[business-id]/external-accounts/update-connection-status/post'
import { usePostExchangePlaidPublicToken } from '@api/businesses/[business-id]/plaid/link/exchange/post'
import { useAccountConfirmationStoreActions } from '@providers/features/linkedAccounts/AccountConfirmationStore/AccountConfirmationStoreProvider'

export type LinkMode = 'update' | 'add'

type LinkSession = {
  token: string
  mode: LinkMode
  onEnd: (isConnected: boolean) => void
}

type UsePlaidLinkModalOptions = {
  /** Called after the connection set changes, so the caller can refresh accounts. */
  onSuccess: () => Awaitable<void>
  onAddConnectionSuccess?: () => Awaitable<void>
  /** When set, the customer owns the Plaid item and handles the public token themselves. */
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
}

/**
 * Drives the embedded Plaid Link modal. `openLink` starts a session with a caller-minted token and
 * resolves once it ends: true when the connection was saved (add) or refreshed (repair), false when
 * Link closed, the exchange failed, or Plaid didn't load. Ending a session clears the token, which
 * makes react-plaid-link destroy the handler.
 */
export function usePlaidLinkModal({
  onSuccess,
  onAddConnectionSuccess,
  customerManagedPlaidConfig,
}: UsePlaidLinkModalOptions) {
  const { usePlaidSandbox } = useEnvironment()
  const { addToast } = useLayerContext()
  const { t } = useTranslation()
  const {
    preload: preloadAccountConfirmation,
    reset: resetAccountConfirmation,
  } = useAccountConfirmationStoreActions()

  const { trigger: triggerExchangePlaidPublicToken } = usePostExchangePlaidPublicToken()
  const { trigger: triggerUpdateConnectionStatus } = usePostUpdateConnectionStatus()

  const [session, setSession] = useState<LinkSession | null>(null)
  const sessionRef = useLatestRef(session)
  const [isLinking, setIsLinking] = useState(false)
  const handleAddConnectionSuccess = onAddConnectionSuccess ?? onSuccess

  // Only the active session may end itself: react-plaid-link force-exits a handler whose token changed.
  const endSession = useCallback((ended: LinkSession, isConnected: boolean) => {
    if (sessionRef.current !== ended) return

    setSession(null)
    ended.onEnd(isConnected)
  }, [sessionRef])

  const notifyConnectFailed = useCallback(() => {
    addToast({
      content: t('linkedAccounts:usePlaidLinkModal.error.connect_account', 'We couldn’t connect your account. Please try again.'),
      type: 'error',
    })
  }, [addToast, t])

  /**
   * When the user has finished entering credentials, send the resulting token to the backend
   * where it will fetch and save the Plaid access token and item id. For a customer-managed
   * item, hand the token to the customer instead: they exchange it, mint a processor token for
   * Layer, and post it to Layer's API before resolving.
   */
  const exchangePlaidPublicToken = useCallback(
    async (current: LinkSession, publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setIsLinking(true)
      preloadAccountConfirmation()

      const exchange = customerManagedPlaidConfig
        ? Promise.resolve().then(() => customerManagedPlaidConfig.onPublicTokenReceived({ publicToken, metadata }))
        : triggerExchangePlaidPublicToken({
          public_token: publicToken,
          institution: metadata.institution,
        })

      await exchange
        .then(
          // Only refresh once the link has actually persisted.
          async () => {
            try {
              await handleAddConnectionSuccess()
            }
            finally {
              endSession(current, true)
            }
          },
          () => {
            notifyConnectFailed()
            endSession(current, false)
          },
        )
        .finally(() => {
          setIsLinking(false)
          resetAccountConfirmation()
        })
    },
    [
      triggerExchangePlaidPublicToken,
      customerManagedPlaidConfig,
      handleAddConnectionSuccess,
      notifyConnectFailed,
      endSession,
      preloadAccountConfirmation,
      resetAccountConfirmation,
    ],
  )

  const { open: plaidLinkStart, ready: plaidLinkReady, error: plaidLinkError } = usePlaidLink({
    token: session?.token ?? null,

    // If in update mode, we don't need to exchange the public token for an access token.
    // The existing access token will automatically become valid again
    onSuccess: (
      publicToken: string,
      metadata: PlaidLinkOnSuccessMetadata,
    ) => {
      if (!session) return

      if (session.mode === 'add') {
        // Note: a sync is kicked off in the backend in this endpoint
        void exchangePlaidPublicToken(session, publicToken, metadata)
      }
      else {
        // Refresh the account connections, which should remove the error
        // pills from any broken accounts
        void triggerUpdateConnectionStatus()
          .then(() => onSuccess())
          .then(() => endSession(session, true), () => endSession(session, false))
      }
    },
    onExit: () => {
      if (session) endSession(session, false)
    },
    env: customerManagedPlaidConfig == null && usePlaidSandbox ? 'sandbox' : undefined,
  })

  useEffect(() => {
    if (plaidLinkReady) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      plaidLinkStart()
    }
  }, [plaidLinkStart, plaidLinkReady])

  const openLink = useCallback(
    (token: string, mode: LinkMode) => new Promise<boolean>((resolve) => {
      // One session at a time, and a Plaid script that failed to load can never open Link.
      if (sessionRef.current) {
        resolve(false)
        return
      }

      if (plaidLinkError) {
        if (mode === 'add') notifyConnectFailed()
        resolve(false)
        return
      }

      setSession({ token, mode, onEnd: resolve })
    }),
    [sessionRef, plaidLinkError, notifyConnectFailed],
  )

  return { isLinking, openLink }
}
