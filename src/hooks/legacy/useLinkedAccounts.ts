import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link'

import { type LoadedStatus } from '@internal-types/general'
import { type AccountSource, type BankAccount, type ExternalAccountConnection } from '@internal-types/linkedAccounts'
import { useListBankAccounts } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { useUnlinkBankAccount } from '@hooks/api/businesses/[business-id]/bank-accounts/useUnlinkBankAccount'
import { useConfirmExternalAccount } from '@hooks/api/businesses/[business-id]/external-accounts/[external-account-id]/confirm'
import { useExcludeExternalAccount } from '@hooks/api/businesses/[business-id]/external-accounts/[external-account-id]/exclude'
import { useUpdateConnectionStatus } from '@hooks/api/businesses/[business-id]/external-accounts/update-connection-status'
import { useBreakPlaidItemConnection } from '@hooks/api/businesses/[business-id]/plaid/items/[plaid-item-id]/sandbox-reset-item-login'
import { useUnlinkPlaidItem } from '@hooks/api/businesses/[business-id]/plaid/items/[plaid-item-id]/unlink'
import { useCreatePlaidLink } from '@hooks/api/businesses/[business-id]/plaid/link'
import { useExchangePlaidPublicToken } from '@hooks/api/businesses/[business-id]/plaid/link/exchange'
import { useCreatePlaidUpdateModeLink } from '@hooks/api/businesses/[business-id]/plaid/update-mode-link'
import { useAccountConfirmationStoreActions } from '@providers/AccountConfirmationStoreProvider'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export function getAccountsNeedingConfirmation(bankAccounts: ReadonlyArray<BankAccount>): ExternalAccountConnection[] {
  return bankAccounts.flatMap(ba =>
    ba.external_accounts.filter(
      ({ notifications }) => notifications?.some(({ type }) => type === 'CONFIRM_RELEVANT'),
    ),
  )
}

type UseLinkedAccounts = () => {
  data?: BankAccount[]
  isLoading: boolean
  loadingStatus: LoadedStatus
  isValidating: boolean
  isLinking: boolean
  error: unknown
  addConnection: (source: AccountSource) => Promise<void>
  removeConnection: (source: AccountSource, sourceId: string) => Promise<void>
  repairConnection: (source: AccountSource, sourceId: string) => Promise<void>
  refetchAccounts: () => Promise<void>
  unlinkBankAccount: (bankAccountId: string) => Promise<void>
  confirmAccount: (source: AccountSource, accountId: string) => Promise<void>
  excludeAccount: (source: AccountSource, accountId: string) => Promise<void>

  // Only works in non-production environments for test purposes
  breakConnection: (source: AccountSource, connectionExternalId: string) => Promise<void>
}

type LinkMode = 'update' | 'add'

/**
 * Returns a memoized action that only runs for Plaid-sourced connections,
 * logging a consistent "not yet supported" message for any other source.
 */
const usePlaidOnlyAction = <Args extends unknown[]>(
  operation: string,
  action: (...args: Args) => Promise<void>,
) =>
  useCallback(
    async (source: AccountSource, ...args: Args) => {
      if (source !== 'PLAID') {
        console.error(`${operation} with source ${source} not yet supported`)
        return
      }

      await action(...args)
    },
    [operation, action],
  )

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const { usePlaidSandbox } = useEnvironment()
  const { addToast } = useLayerContext()
  const { t } = useTranslation()
  const {
    preload: preloadAccountConfirmation,
    reset: resetAccountConfirmation,
  } = useAccountConfirmationStoreActions()

  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')
  const [linkMode, setLinkMode] = useState<LinkMode>('add')
  const [isLinking, setIsLinking] = useState(false)

  const {
    data: bankAccounts,
    isLoading,
    isValidating,
    error: responseError,
    mutate,
  } = useListBankAccounts()
  const { trigger: triggerUnlinkBankAccount } = useUnlinkBankAccount()
  const { trigger: triggerCreatePlaidLink } = useCreatePlaidLink()
  const { trigger: triggerCreatePlaidUpdateModeLink } = useCreatePlaidUpdateModeLink()
  const { trigger: triggerExchangePlaidPublicToken } = useExchangePlaidPublicToken()
  const { trigger: triggerConfirmExternalAccount } = useConfirmExternalAccount()
  const { trigger: triggerExcludeExternalAccount } = useExcludeExternalAccount()
  const { trigger: triggerUpdateConnectionStatus } = useUpdateConnectionStatus()
  const { trigger: triggerUnlinkPlaidItem } = useUnlinkPlaidItem()
  const { trigger: triggerBreakPlaidItemConnection } = useBreakPlaidItemConnection()

  useEffect(() => {
    if (!isLoading && bankAccounts) {
      setLoadingStatus('complete')
      return
    }

    if (isLoading && loadingStatus === 'initial') {
      setLoadingStatus('loading')
      return
    }

    if (!isLoading && loadingStatus === 'loading') {
      setLoadingStatus('complete')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const refetchAccounts = useCallback(async () => {
    await mutate()
  }, [mutate])

  /**
   * Runs a mutation, refreshing the account list on success and surfacing an
   * error toast on failure. A failed refresh is not reported as a mutation
   * failure, since the mutation itself succeeded.
   */
  const mutateAndRefetchAccounts = useCallback(
    (mutation: () => Promise<unknown>, errorMessage: string) =>
      mutation().then(
        () => refetchAccounts(),
        () => addToast({ content: errorMessage, type: 'error' }),
      ),
    [refetchAccounts, addToast],
  )

  /**
   * Requests a Plaid link token, opening the relevant flow on success and
   * surfacing an error toast on failure.
   */
  const fetchLinkToken = useCallback(
    (
      mode: LinkMode,
      requestToken: () => Promise<{ linkToken: string } | undefined>,
      errorMessage: string,
    ) =>
      requestToken().then(
        (result) => {
          if (!result) return

          setLinkMode(mode)
          setLinkToken(result.linkToken)
        },
        () => addToast({ content: errorMessage, type: 'error' }),
      ),
    [addToast],
  )

  /**
   * Initiates an add connection flow with Plaid
   */
  const fetchPlaidLinkToken = useCallback(
    () => fetchLinkToken(
      'add',
      () => triggerCreatePlaidLink({}),
      t('linkedAccounts:error.start_connection', 'We couldn’t initiate the Plaid connection flow. Please try again.'),
    ),
    [fetchLinkToken, triggerCreatePlaidLink, t],
  )

  /**
   * Initiates a connection repair flow with Plaid
   */
  const fetchPlaidUpdateModeLinkToken = useCallback(
    (plaidItemPlaidId: string) => fetchLinkToken(
      'update',
      () => triggerCreatePlaidUpdateModeLink({ plaidItemId: plaidItemPlaidId }),
      t('linkedAccounts:error.repair_connection', 'We couldn’t start the connection repair flow. Please try again.'),
    ),
    [fetchLinkToken, triggerCreatePlaidUpdateModeLink, t],
  )

  /**
   * When the user has finished entering credentials, send the resulting
   * token to the backend where it will fetch and save the Plaid access token
   * and item id.
   */
  const exchangePlaidPublicToken = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setIsLinking(true)
      preloadAccountConfirmation()

      await mutateAndRefetchAccounts(
        () => triggerExchangePlaidPublicToken({
          public_token: publicToken,
          institution: metadata.institution,
        }),
        t('linkedAccounts:error.connect_account', 'We couldn’t finish connecting your account. Please try again.'),
      ).finally(() => {
        setIsLinking(false)
        resetAccountConfirmation()
      })
    },
    [mutateAndRefetchAccounts, triggerExchangePlaidPublicToken, t, preloadAccountConfirmation, resetAccountConfirmation],
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
          void refetchAccounts()
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

  const addConnection = usePlaidOnlyAction('Adding a connection', fetchPlaidLinkToken)

  const repairConnection = usePlaidOnlyAction('Repairing a connection', fetchPlaidUpdateModeLinkToken)

  const handleRemoveConnection = useCallback(
    (connectionExternalId: string) => mutateAndRefetchAccounts(
      () => triggerUnlinkPlaidItem({ plaidItemId: connectionExternalId }),
      t('linkedAccounts:error.remove_connection', 'We couldn’t remove the connection. Please try again.'),
    ),
    [mutateAndRefetchAccounts, triggerUnlinkPlaidItem, t],
  )
  const removeConnection = usePlaidOnlyAction('Removing a connection', handleRemoveConnection)

  const handleConfirmAccount = useCallback(
    (accountId: string) => mutateAndRefetchAccounts(
      () => triggerConfirmExternalAccount({ accountId }),
      t('linkedAccounts:error.confirm_account', 'We couldn’t confirm the account. Please try again.'),
    ),
    [mutateAndRefetchAccounts, triggerConfirmExternalAccount, t],
  )
  const confirmAccount = usePlaidOnlyAction('Confirming an account', handleConfirmAccount)

  const handleExcludeAccount = useCallback(
    (accountId: string) => mutateAndRefetchAccounts(
      () => triggerExcludeExternalAccount({ accountId, body: { is_duplicate: true } }),
      t('linkedAccounts:error.exclude_account', 'We couldn’t exclude the account. Please try again.'),
    ),
    [mutateAndRefetchAccounts, triggerExcludeExternalAccount, t],
  )
  const excludeAccount = usePlaidOnlyAction('Excluding an account', handleExcludeAccount)

  const handleBreakConnection = useCallback(
    (connectionExternalId: string) => mutateAndRefetchAccounts(
      () => triggerBreakPlaidItemConnection({ plaidItemId: connectionExternalId }),
      t('linkedAccounts:error.break_connection', 'We couldn’t reset the connection. Please try again.'),
    ),
    [mutateAndRefetchAccounts, triggerBreakPlaidItemConnection, t],
  )
  /**
   * Test utility that puts a connection into a broken state; only works in non-production
   * environments.
   */
  const breakConnection = usePlaidOnlyAction('Breaking a sandbox connection', handleBreakConnection)

  const unlinkBankAccount = useCallback(
    (bankAccountId: string) => mutateAndRefetchAccounts(
      () => triggerUnlinkBankAccount(bankAccountId),
      t('linkedAccounts:error.unlink_account', 'We couldn’t unlink the account. Please try again.'),
    ),
    [mutateAndRefetchAccounts, triggerUnlinkBankAccount, t],
  )

  return {
    data: bankAccounts ?? [],
    isLoading,
    loadingStatus,
    isValidating,
    isLinking,
    error: responseError,
    addConnection,
    removeConnection,
    repairConnection,
    refetchAccounts,
    unlinkBankAccount,
    confirmAccount,
    excludeAccount,
    breakConnection,
  }
}
