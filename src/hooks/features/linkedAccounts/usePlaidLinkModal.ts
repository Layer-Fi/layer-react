import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type PlaidInstitution,
  type PlaidLinkError,
  type PlaidLinkOnExitMetadata,
  type PlaidLinkOnSuccessMetadata,
  usePlaidLink,
} from 'react-plaid-link'

import type { Awaitable } from '@internal-types/utility/awaitable'
import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { PlaidLinkClientOutcome, type ReportPlaidLinkOutcomeParams } from '@schemas/features/linkedAccounts/plaidLinkOutcome'
import { useEnvironment } from '@providers/global/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { useLatestRef } from '@hooks/utils/react/useLatestRef'
import { usePostUpdateConnectionStatus } from '@api/businesses/[business-id]/external-accounts/update-connection-status/post'
import { usePostExchangePlaidPublicToken } from '@api/businesses/[business-id]/plaid/link/exchange/post'
import { usePostPlaidLinkOutcome } from '@api/businesses/[business-id]/plaid/link/outcome/post'
import { useAccountConfirmationStoreActions } from '@providers/features/linkedAccounts/AccountConfirmationStore/AccountConfirmationStoreProvider'

export type LinkMode = 'update' | 'add'

type LinkSession = {
  token: string
  mode: LinkMode
  resolve: (isConnected: boolean) => void
}

type UsePlaidLinkModalOptions = {
  /** Called after the connection set changes, so the caller can refresh accounts. */
  onSuccess: () => Awaitable<void>
  onAddConnectionSuccess?: () => Awaitable<void>
  /** When set, the customer owns the Plaid item and handles the public token themselves. */
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
}

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
 * `openLink` resolves true once the connection is saved (add) or refreshed (repair), false when Link
 * closed, the exchange failed, or Plaid didn't load. Link is released as soon as it succeeds or
 * exits, which clears the token so react-plaid-link destroys the handler.
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
  const { trigger: triggerPlaidLinkOutcome } = usePostPlaidLinkOutcome()

  const reportPlaidLinkOutcome = useCallback((params: ReportPlaidLinkOutcomeParams) => {
    void triggerPlaidLinkOutcome(params).catch(() => undefined)
  }, [triggerPlaidLinkOutcome])

  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.LinkedAccounts)

  const emitPlaidLinkFinished = useCallback(
    (linkMode: LinkMode, metadata: PlaidLinkOnSuccessMetadata | PlaidLinkOnExitMetadata, error: PlaidLinkError | null = null) => {
      const isExit = 'status' in metadata
      const exitOutcome = error ? 'error' : 'exited'

      emitLayerEvent({
        type: LayerEventType.LinkedAccountsLinkFinished,
        version: 1,
        payload: {
          provider: 'PLAID',
          outcome: isExit ? exitOutcome : 'completed',
          linkMode,
          linkSessionId: metadata.link_session_id,
          institution: toLinkFinishedInstitution(metadata.institution),
          exitStatus: isExit ? metadata.status : null,
          error: toLinkFinishedError(error),
        },
      })
    },
    [emitLayerEvent],
  )

  const [session, setSession] = useState<LinkSession | null>(null)
  const sessionRef = useLatestRef(session)
  // Set by openLink and cleared by the session's own resolve, so one flow runs at a time from open to outcome.
  const pendingSessionRef = useRef<LinkSession | null>(null)
  const [isLinking, setIsLinking] = useState(false)
  const handleAddConnectionSuccess = onAddConnectionSuccess ?? onSuccess

  // Link is done with the session. A stale handler (react-plaid-link force-exits one whose token
  // changed) finds its session already released and does nothing.
  const releaseLink = useCallback((current: LinkSession) => {
    if (sessionRef.current !== current) return false

    setSession(null)
    return true
  }, [sessionRef])

  const notifySessionFailed = useCallback((mode: LinkMode) => {
    addToast({
      content: mode === 'add'
        ? t('linkedAccounts:usePlaidLinkModal.error.connect_account', 'We couldn’t connect your account. Please try again.')
        : t('linkedAccounts:usePlaidLinkModal.error.repair_connection', 'We couldn’t repair the connection to your account. Please try again.'),
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
              current.resolve(true)
            }
          },
          () => {
            notifySessionFailed('add')
            current.resolve(false)
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
      notifySessionFailed,
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
      if (!session || !releaseLink(session)) return

      reportPlaidLinkOutcome({ outcome: PlaidLinkClientOutcome.Completed })
      emitPlaidLinkFinished(session.mode, metadata)

      if (session.mode === 'add') {
        // Note: a sync is kicked off in the backend in this endpoint
        void exchangePlaidPublicToken(session, publicToken, metadata)
      }
      else {
        // Refresh the account connections, which should remove the error
        // pills from any broken accounts
        void triggerUpdateConnectionStatus()
          .then(() => onSuccess())
          .then(
            () => session.resolve(true),
            () => {
              notifySessionFailed('update')
              session.resolve(false)
            },
          )
      }
    },
    onExit: (error, metadata) => {
      if (!session || !releaseLink(session)) return

      reportPlaidLinkOutcome(
        error
          ? { outcome: PlaidLinkClientOutcome.Error, errorCode: error.error_code }
          : { outcome: PlaidLinkClientOutcome.Exited },
      )
      emitPlaidLinkFinished(session.mode, metadata, error)
      session.resolve(false)
    },
    env: customerManagedPlaidConfig == null && usePlaidSandbox ? 'sandbox' : undefined,
  })

  useEffect(() => {
    if (plaidLinkReady) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      plaidLinkStart()
    }
  }, [plaidLinkStart, plaidLinkReady])

  // A Plaid script that fails to load can never open Link.
  useEffect(() => {
    if (!plaidLinkError || !session || !releaseLink(session)) return

    notifySessionFailed(session.mode)
    session.resolve(false)
  }, [plaidLinkError, session, notifySessionFailed, releaseLink])

  const openLink = useCallback(
    (token: string, mode: LinkMode) => new Promise<boolean>((resolve) => {
      if (pendingSessionRef.current) {
        resolve(false)
        return
      }

      const nextSession: LinkSession = {
        token,
        mode,
        resolve: (isConnected) => {
          pendingSessionRef.current = null
          resolve(isConnected)
        },
      }
      pendingSessionRef.current = nextSession
      setSession(nextSession)
    }),
    [],
  )

  return { isLinking, openLink }
}
