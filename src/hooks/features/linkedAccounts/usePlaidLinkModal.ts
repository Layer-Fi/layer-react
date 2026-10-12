import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type PlaidInstitution, type PlaidLinkError, type PlaidLinkOnExit, type PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link'

import type { Awaitable } from '@internal-types/utility/awaitable'
import { LayerEventComponent, LayerEventType, type LinkedAccountsLinkFinishedEventV1 } from '@schemas/common/layerEvents'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { PlaidLinkClientOutcome, type ReportPlaidLinkOutcomeParams } from '@schemas/features/linkedAccounts/plaidLinkOutcome'
import { useEnvironment } from '@providers/global/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { usePostUpdateConnectionStatus } from '@api/businesses/[business-id]/external-accounts/update-connection-status/post'
import { usePostExchangePlaidPublicToken } from '@api/businesses/[business-id]/plaid/link/exchange/post'
import { usePostPlaidLinkOutcome } from '@api/businesses/[business-id]/plaid/link/outcome/post'
import { useAccountConfirmationStoreActions } from '@providers/features/linkedAccounts/AccountConfirmationStore/AccountConfirmationStoreProvider'

export type LinkMode = 'update' | 'add'

type UsePlaidLinkModalOptions = {
  /** Link token to open the Plaid modal with, or null when idle. */
  linkToken: string | null
  /** Whether the open token is for adding a connection or repairing one. */
  linkMode: LinkMode
  /** Called after the connection set changes, so the caller can refresh accounts. */
  onSuccess: () => Awaitable<void>
  onAddConnectionSuccess?: () => Awaitable<void>
  /** Updates the active link mode; reset to 'add' when a flow completes or the modal exits. */
  setLinkMode: (mode: LinkMode) => void
  /** When set, the customer owns the Plaid item and handles the public token themselves. */
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
}

type LinkFinishedPayload = typeof LinkedAccountsLinkFinishedEventV1.Type['payload']

const toLinkFinishedInstitution = (institution: PlaidInstitution | null) =>
  institution ? { id: institution.institution_id, name: institution.name } : null

const toLinkFinishedError = (error: PlaidLinkError | null) =>
  error
    ? {
      type: error.error_type,
      code: error.error_code,
      message: error.error_message,
      displayMessage: error.display_message || null,
    }
    : null

/**
 * Drives the embedded Plaid Link modal for a token owned by the caller: opening
 * the widget, exchanging the public token (add) or refreshing connection status
 * (repair) on completion, and notifying the caller to refresh accounts.
 */
export function usePlaidLinkModal({
  linkToken,
  linkMode,
  onSuccess,
  onAddConnectionSuccess,
  setLinkMode,
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
  const { trigger: triggerPlaidLinkOutcome } = usePostPlaidLinkOutcome()

  const reportPlaidLinkOutcome = useCallback((params: ReportPlaidLinkOutcomeParams) => {
    void triggerPlaidLinkOutcome(params).catch(() => undefined)
  }, [triggerPlaidLinkOutcome])

  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.LinkedAccounts)

  const emitLinkFinished = useCallback((payload: Omit<LinkFinishedPayload, 'provider' | 'linkMode'>) => {
    emitLayerEvent({
      type: LayerEventType.LinkedAccountsLinkFinished,
      version: 1,
      payload: { provider: 'PLAID', linkMode, ...payload },
    })
  }, [emitLayerEvent, linkMode])

  const handlePlaidLinkExit: PlaidLinkOnExit = (error, metadata) => {
    reportPlaidLinkOutcome(
      error
        ? { outcome: PlaidLinkClientOutcome.Error, errorCode: error.error_code }
        : { outcome: PlaidLinkClientOutcome.Exited },
    )
    emitLinkFinished({
      outcome: error ? 'error' : 'exited',
      linkSessionId: metadata.link_session_id,
      institution: toLinkFinishedInstitution(metadata.institution),
      exitStatus: metadata.status,
      error: toLinkFinishedError(error),
    })

    setLinkMode('add')
  }

  const [isLinking, setIsLinking] = useState(false)
  const handleAddConnectionSuccess = onAddConnectionSuccess ?? onSuccess

  /**
   * When the user has finished entering credentials, send the resulting token to the backend
   * where it will fetch and save the Plaid access token and item id. For a customer-managed
   * item, hand the token to the customer instead: they exchange it, mint a processor token for
   * Layer, and post it to Layer's API before resolving.
   */
  const exchangePlaidPublicToken = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
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
          () => handleAddConnectionSuccess(),
          () => addToast({
            content: t('linkedAccounts:usePlaidLinkModal.error.connect_account', 'We couldn’t connect your account. Please try again.'),
            type: 'error',
          }),
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
      addToast,
      t,
      preloadAccountConfirmation,
      resetAccountConfirmation,
    ],
  )

  // If in update mode, we don't need to exchange the public token for an access token.
  // The existing access token will automatically become valid again
  const handlePlaidLinkSuccess = useCallback(
    (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      reportPlaidLinkOutcome({ outcome: PlaidLinkClientOutcome.Completed })
      emitLinkFinished({
        outcome: 'completed',
        linkSessionId: metadata.link_session_id,
        institution: toLinkFinishedInstitution(metadata.institution),
        exitStatus: null,
        error: null,
      })

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
    [
      reportPlaidLinkOutcome,
      emitLinkFinished,
      linkMode,
      exchangePlaidPublicToken,
      triggerUpdateConnectionStatus,
      onSuccess,
      setLinkMode,
    ],
  )

  const { open: plaidLinkStart, ready: plaidLinkReady } = usePlaidLink({
    token: linkToken,
    onSuccess: handlePlaidLinkSuccess,
    onExit: handlePlaidLinkExit,
    env: customerManagedPlaidConfig == null && usePlaidSandbox ? 'sandbox' : undefined,
  })

  useEffect(() => {
    if (plaidLinkReady) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      plaidLinkStart()
    }
  }, [plaidLinkStart, plaidLinkReady])

  return { isLinking }
}
