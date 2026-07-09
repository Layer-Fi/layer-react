import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type AccountSource } from '@internal-types/linkedAccounts'
import type { Awaitable } from '@internal-types/utility/promises'
import { type PlaidHostedLinkConfig, toCreatePlaidLinkParams } from '@schemas/linkedAccounts/plaid'
import { useUnlinkBankAccount } from '@hooks/api/businesses/[business-id]/bank-accounts/useUnlinkBankAccount'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useConfirmExternalAccount } from '@hooks/api/businesses/[business-id]/external-accounts/[external-account-id]/confirm'
import { useExcludeExternalAccount } from '@hooks/api/businesses/[business-id]/external-accounts/[external-account-id]/exclude'
import { useBreakPlaidItemConnection } from '@hooks/api/businesses/[business-id]/plaid/items/[plaid-item-id]/sandbox-reset-item-login'
import { useUnlinkPlaidItem } from '@hooks/api/businesses/[business-id]/plaid/items/[plaid-item-id]/unlink'
import { useCreatePlaidLink } from '@hooks/api/businesses/[business-id]/plaid/link'
import { useCreatePlaidUpdateModeLink } from '@hooks/api/businesses/[business-id]/plaid/update-mode-link'
import { type LinkMode, usePlaidLinkModal } from '@hooks/features/linkedAccounts/usePlaidLinkModal'
import { usePollPlaidHostedLinkStatus } from '@hooks/features/linkedAccounts/usePollPlaidHostedLinkStatus'
import { useBankAccountsContext } from '@contexts/BankAccountsContext/BankAccountsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type UseLinkedAccountsOptions = {
  onPlaidConnectionSuccess?: () => Awaitable<void>
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
}

type UseLinkedAccounts = (options?: UseLinkedAccountsOptions) => {
  isLinking: boolean
  isHostedLinkError: boolean
  addConnection: (source: AccountSource) => Promise<void>
  removeConnection: (source: AccountSource, sourceId: string) => Promise<void>
  repairConnection: (source: AccountSource, sourceId: string) => Promise<void>
  refetchAccountsAndTransactions: () => Promise<void>
  unlinkBankAccount: (bankAccountId: string) => Promise<void>
  confirmAccount: (source: AccountSource, accountId: string) => Promise<void>
  excludeAccount: (source: AccountSource, accountId: string) => Promise<void>

  // Only works in non-production environments for test purposes
  breakConnection: (source: AccountSource, connectionExternalId: string) => Promise<void>
}

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

export const useLinkedAccounts: UseLinkedAccounts = ({ onPlaidConnectionSuccess, plaidHostedLinkConfig } = {}) => {
  const { addToast } = useLayerContext()
  const { t } = useTranslation()

  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [linkMode, setLinkMode] = useState<LinkMode>('add')

  const { refetch } = useBankAccountsContext()
  const { trigger: triggerUnlinkBankAccount } = useUnlinkBankAccount()
  const { trigger: triggerCreatePlaidLink } = useCreatePlaidLink()
  const { trigger: triggerCreatePlaidUpdateModeLink } = useCreatePlaidUpdateModeLink()
  const { trigger: triggerConfirmExternalAccount } = useConfirmExternalAccount()
  const { trigger: triggerExcludeExternalAccount } = useExcludeExternalAccount()
  const { trigger: triggerUnlinkPlaidItem } = useUnlinkPlaidItem()
  const { trigger: triggerBreakPlaidItemConnection } = useBreakPlaidItemConnection()

  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()

  const refetchAccountsAndTransactions = useCallback(async () => {
    await Promise.all([
      refetch(),
      forceReloadBankTransactions(),
    ])
  }, [refetch, forceReloadBankTransactions])

  const handlePlaidConnectionSuccess = useCallback(async () => {
    await refetchAccountsAndTransactions().catch(() => undefined)
    await onPlaidConnectionSuccess?.()
  }, [refetchAccountsAndTransactions, onPlaidConnectionSuccess])

  const { isLinking } = usePlaidLinkModal({
    linkToken,
    linkMode,
    setLinkMode,
    onSuccess: refetchAccountsAndTransactions,
    onAddConnectionSuccess: handlePlaidConnectionSuccess,
  })

  const { isFailed: isHostedLinkError } = usePollPlaidHostedLinkStatus({
    enabled: plaidHostedLinkConfig != null,
    onSuccess: handlePlaidConnectionSuccess,
  })

  /**
   * Runs a mutation, refetching accounts and transactions on success and showing
   * an error toast on failure
   *
   * Note: this swallows rejections (the failure becomes a toast and the returned
   * promise resolves), so it must not back an `onConfirm`/submit handler whose
   * caller relies on a rejection to show errors — e.g. BaseConfirmationModal.
   */
  const mutateAndRefetchWithToast = useCallback(
    (mutation: () => Promise<unknown>, errorMessage: string) =>
      mutation().then(
        () => refetchAccountsAndTransactions(),
        () => addToast({ content: errorMessage, type: 'error' }),
      ),
    [refetchAccountsAndTransactions, addToast],
  )

  /**
   * Requests a Plaid link token, opening the relevant flow on success and
   * surfacing an error toast on failure.
   */
  const fetchLinkToken = useCallback(
    (
      mode: LinkMode,
      requestToken: () => Promise<{ linkToken: string, hostedLink?: string | null } | undefined>,
      errorMessage: string,
      // Snapshotted with the request so the response is handled with the same
      // config, even if the prop changes while the request is in flight.
      hostedLinkConfig?: PlaidHostedLinkConfig,
    ) =>
      requestToken().then(
        async (result) => {
          if (!result) return

          // When a hosted-link config is supplied, hand the Plaid-owned URL to the
          // customer platform to navigate to rather than opening the embedded modal.
          if (hostedLinkConfig && result.hostedLink) {
            await hostedLinkConfig.navigateToHostedLink(result.hostedLink)
            return
          }

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
      () => triggerCreatePlaidLink(toCreatePlaidLinkParams(plaidHostedLinkConfig)),
      t('linkedAccounts:error.start_connection', 'We couldn’t initiate the Plaid connection flow. Please try again.'),
      plaidHostedLinkConfig,
    ),
    [fetchLinkToken, triggerCreatePlaidLink, plaidHostedLinkConfig, t],
  )

  /**
   * Initiates a connection repair flow with Plaid
   */
  const fetchPlaidUpdateModeLinkToken = useCallback(
    (plaidItemPlaidId: string) => fetchLinkToken(
      'update',
      () => triggerCreatePlaidUpdateModeLink({ plaidItemId: plaidItemPlaidId }),
      t('linkedAccounts:error.repair_connection', 'We couldn’t repair the Plaid connection with your account. Please try again.'),
      plaidHostedLinkConfig,
    ),
    [fetchLinkToken, triggerCreatePlaidUpdateModeLink, plaidHostedLinkConfig, t],
  )

  const addConnection = usePlaidOnlyAction('Adding a connection', fetchPlaidLinkToken)

  const repairConnection = usePlaidOnlyAction('Repairing a connection', fetchPlaidUpdateModeLinkToken)

  const handleRemoveConnection = useCallback(
    (connectionExternalId: string) => mutateAndRefetchWithToast(
      () => triggerUnlinkPlaidItem({ plaidItemId: connectionExternalId }),
      t('linkedAccounts:error.remove_connection', 'We couldn’t remove this connection. Please try again.'),
    ),
    [mutateAndRefetchWithToast, triggerUnlinkPlaidItem, t],
  )
  const removeConnection = usePlaidOnlyAction('Removing a connection', handleRemoveConnection)

  const handleConfirmAccount = useCallback(
    (accountId: string) => mutateAndRefetchWithToast(
      () => triggerConfirmExternalAccount({ accountId }),
      t('linkedAccounts:error.confirm_account', 'We couldn’t confirm your account. Please try again.'),
    ),
    [mutateAndRefetchWithToast, triggerConfirmExternalAccount, t],
  )
  const confirmAccount = usePlaidOnlyAction('Confirming an account', handleConfirmAccount)

  const handleExcludeAccount = useCallback(
    (accountId: string) => mutateAndRefetchWithToast(
      () => triggerExcludeExternalAccount({ accountId, body: { is_duplicate: true } }),
      t('linkedAccounts:error.exclude_account', 'We couldn’t exclude your account. Please try again.'),
    ),
    [mutateAndRefetchWithToast, triggerExcludeExternalAccount, t],
  )
  const excludeAccount = usePlaidOnlyAction('Excluding an account', handleExcludeAccount)

  const handleBreakConnection = useCallback(
    (connectionExternalId: string) => mutateAndRefetchWithToast(
      () => triggerBreakPlaidItemConnection({ plaidItemId: connectionExternalId }),
      t('linkedAccounts:error.break_connection', 'We couldn’t reset this connection. Please try again.'),
    ),
    [mutateAndRefetchWithToast, triggerBreakPlaidItemConnection, t],
  )
  /**
   * Test utility that puts a connection into a broken state; only works in non-production
   * environments.
   */
  const breakConnection = usePlaidOnlyAction('Breaking a sandbox connection', handleBreakConnection)

  // Not `mutateAndRefetchWithToast`: this backs a BaseConfirmationModal that
  // needs the promise to reject on failure (the helper swallows rejections).
  const unlinkBankAccount = useCallback(
    async (bankAccountId: string) => {
      await triggerUnlinkBankAccount(bankAccountId)
      await refetchAccountsAndTransactions()
    },
    [triggerUnlinkBankAccount, refetchAccountsAndTransactions],
  )

  return {
    isLinking,
    isHostedLinkError,
    addConnection,
    removeConnection,
    repairConnection,
    refetchAccountsAndTransactions,
    unlinkBankAccount,
    confirmAccount,
    excludeAccount,
    breakConnection,
  }
}
