import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link'

import type { Awaitable } from '@internal-types/utility/promises'
import { useUpdateConnectionStatus } from '@hooks/api/businesses/[business-id]/external-accounts/update-connection-status'
import { useExchangePlaidPublicToken } from '@hooks/api/businesses/[business-id]/plaid/link/exchange'
import { useAccountConfirmationStoreActions } from '@providers/AccountConfirmationStoreProvider'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type LinkMode = 'update' | 'add'

type UsePlaidLinkModalOptions = {
  /** Link token to open the Plaid modal with, or null when idle. */
  linkToken: string | null
  /** Whether the open token is for adding a connection or repairing one. */
  linkMode: LinkMode
  /** Called after the connection set changes, so the caller can refresh accounts. */
  onSuccess: () => Awaitable<void>
  /** Updates the active link mode; reset to 'add' when a flow completes or the modal exits. */
  setLinkMode: (mode: LinkMode) => void
}

/**
 * Drives the embedded Plaid Link modal for a token owned by the caller: opening
 * the widget, exchanging the public token (add) or refreshing connection status
 * (repair) on completion, and notifying the caller to refresh accounts.
 */
export function usePlaidLinkModal({
  linkToken,
  linkMode,
  onSuccess,
  setLinkMode,
}: UsePlaidLinkModalOptions) {
  const { usePlaidSandbox } = useEnvironment()
  const { addToast } = useLayerContext()
  const { t } = useTranslation()
  const {
    preload: preloadAccountConfirmation,
    reset: resetAccountConfirmation,
  } = useAccountConfirmationStoreActions()

  const { trigger: triggerExchangePlaidPublicToken } = useExchangePlaidPublicToken()
  const { trigger: triggerUpdateConnectionStatus } = useUpdateConnectionStatus()

  const [isLinking, setIsLinking] = useState(false)

  /**
   * When the user has finished entering credentials, send the resulting
   * token to the backend where it will fetch and save the Plaid access token
   * and item id.
   */
  const exchangePlaidPublicToken = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setIsLinking(true)
      preloadAccountConfirmation()

      await triggerExchangePlaidPublicToken({
        public_token: publicToken,
        institution: metadata.institution,
      })
        .then(
          // Only refresh once the link has actually persisted.
          () => onSuccess(),
          () => addToast({
            content: t('linkedAccounts:error.connect_account', 'We couldn’t connect your account. Please try again.'),
            type: 'error',
          }),
        )
        .finally(() => {
          setIsLinking(false)
          resetAccountConfirmation()
        })
    },
    [triggerExchangePlaidPublicToken, onSuccess, addToast, t, preloadAccountConfirmation, resetAccountConfirmation],
  )

  const { open: plaidLinkStart, ready: plaidLinkReady } = usePlaidLink({
    token: linkToken,

    // If in update mode, we don't need to exchange the public token for an access token.
    // The existing access token will automatically become valid again
    onSuccess: (
      publicToken: string,
      metadata: PlaidLinkOnSuccessMetadata,
    ) => {
      if (linkMode == 'add') {
        // Note: a sync is kicked off in the backend in this endpoint
        void exchangePlaidPublicToken(publicToken, metadata)
      }
      else {
        // Refresh the account connections, which should remove the error
        // pills from any broken accounts
        void triggerUpdateConnectionStatus().then(() => {
          void onSuccess()
          setLinkMode('add')
        })
      }
    },
    onExit: () => setLinkMode('add'),
    env: usePlaidSandbox ? 'sandbox' : undefined,
  })

  useEffect(() => {
    if (plaidLinkReady) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      plaidLinkStart()
    }
  }, [plaidLinkStart, plaidLinkReady])

  return { isLinking }
}
