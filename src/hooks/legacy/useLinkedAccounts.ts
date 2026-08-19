import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type AccountSource } from '@internal-types/features/linkedAccounts/linkedAccount'
import type { Awaitable } from '@internal-types/utility/awaitable'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { type PlaidHostedLinkConfig, toCreatePlaidLinkParams } from '@schemas/features/linkedAccounts/plaidHostedLinkConfig'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useUnlinkBankAccount } from '@api/businesses/[business-id]/bank-accounts/[bank-account-id]/delete'
import { useBankTransactionsGlobalCacheActions } from '@api/businesses/[business-id]/bank-transactions/get'
import { usePostConfirmExternalAccount } from '@api/businesses/[business-id]/external-accounts/[external-account-id]/confirm/post'
import { usePostExcludeExternalAccount } from '@api/businesses/[business-id]/external-accounts/[external-account-id]/exclude/post'
import { usePostSandboxResetPlaidItemLogin } from '@api/businesses/[business-id]/plaid/items/[plaid-item-id]/sandbox-reset-item-login/post'
import { usePostUnlinkPlaidItem } from '@api/businesses/[business-id]/plaid/items/[plaid-item-id]/unlink/post'
import { usePostPlaidLink } from '@api/businesses/[business-id]/plaid/link/post'
import { usePostPlaidUpdateModeLink } from '@api/businesses/[business-id]/plaid/update-mode-link/post'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { type LinkMode, usePlaidLinkModal } from '@hooks/features/linkedAccounts/usePlaidLinkModal'
import { usePollPlaidHostedLinkStatus } from '@hooks/features/linkedAccounts/usePollPlaidHostedLinkStatus'

type UseLinkedAccountsOptions = {
  onPlaidConnectionSuccess?: () => Awaitable<void>
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
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

/**
 * Returns a memoized action that only runs while Layer owns the Plaid item, logging a consistent
 * message otherwise. Customer-managed items are minted by the customer's Plaid client, so Layer
 * has no credentials to act on them.
 */
const useLayerOwnedItemAction = <Args extends unknown[]>(
  operation: string,
  isCustomerManaged: boolean,
  action: (...args: Args) => Promise<void>,
) =>
  useCallback(
    async (...args: Args) => {
      if (isCustomerManaged) {
        console.error(`${operation} is not supported for customer-managed Plaid items`)
        return
      }

      await action(...args)
    },
    [operation, isCustomerManaged, action],
  )

export const useLinkedAccounts: UseLinkedAccounts = ({
  onPlaidConnectionSuccess,
  plaidHostedLinkConfig,
  customerManagedPlaidConfig,
} = {}) => {
  if (plaidHostedLinkConfig && customerManagedPlaidConfig) {
    throw new Error('useLinkedAccounts: plaidHostedLinkConfig and customerManagedPlaidConfig are mutually exclusive')
  }

  const { addToast } = useLayerContext()
  const { t } = useTranslation()

  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [linkMode, setLinkMode] = useState<LinkMode>('add')

  const { refetch } = useBankAccountsContext()
  const { trigger: triggerUnlinkBankAccount } = useUnlinkBankAccount()

  const { trigger: triggerCreatePlaidLink } = usePostPlaidLink()
  const { trigger: triggerCreatePlaidUpdateModeLink } = usePostPlaidUpdateModeLink()

  const { trigger: triggerConfirmExternalAccount } = usePostConfirmExternalAccount()
  const { trigger: triggerExcludeExternalAccount } = usePostExcludeExternalAccount()

  const { trigger: triggerUnlinkPlaidItem } = usePostUnlinkPlaidItem()
  const { trigger: triggerBreakPlaidItemConnection } = usePostSandboxResetPlaidItemLogin()

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
    customerManagedPlaidConfig,
  })

  const { isFailed: isHostedLinkError } = usePollPlaidHostedLinkStatus({
    enabled: plaidHostedLinkConfig != null,
    onSuccess: refetchAccountsAndTransactions,
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
   * Requests a Plaid link token, opening the embedded modal on success and
   * surfacing an error toast on failure. A request resolving `undefined` is
   * treated as already handled and opens nothing.
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

  // The config is snapshotted with the request so the response is handled with the same
  // config, even if the prop changes while the request is in flight.
  const withHostedLinkRedirect = useCallback(
    (
      requestToken: () => Promise<{ linkToken: string, hostedLink?: string | null } | undefined>,
      hostedLinkConfig?: PlaidHostedLinkConfig,
    ) =>
      async () => {
        const result = await requestToken()
        if (!result) return

        if (hostedLinkConfig && result.hostedLink) {
          await hostedLinkConfig.navigateToHostedLink(result.hostedLink)
          return
        }

        return result
      },
    [],
  )

  /**
   * Initiates an add connection flow with Plaid
   */
  const fetchPlaidLinkToken = useCallback(
    () => fetchLinkToken(
      'add',
      customerManagedPlaidConfig
        ? () => Promise.resolve().then(() => customerManagedPlaidConfig.createLinkToken())
        : withHostedLinkRedirect(
          () => triggerCreatePlaidLink(toCreatePlaidLinkParams(plaidHostedLinkConfig)),
          plaidHostedLinkConfig,
        ),
      t('linkedAccounts:useLinkedAccounts.error.start_connection', 'We couldn’t initiate the Plaid connection flow. Please try again.'),
    ),
    [fetchLinkToken, withHostedLinkRedirect, triggerCreatePlaidLink, plaidHostedLinkConfig, customerManagedPlaidConfig, t],
  )

  /**
   * Initiates a connection repair flow with Plaid
   */
  const fetchPlaidUpdateModeLinkToken = useCallback(
    (plaidItemPlaidId: string) => fetchLinkToken(
      'update',
      customerManagedPlaidConfig
        ? () => Promise.resolve().then(() => customerManagedPlaidConfig.createUpdateModeLinkToken(plaidItemPlaidId))
        : withHostedLinkRedirect(
          () => triggerCreatePlaidUpdateModeLink({ plaidItemId: plaidItemPlaidId }),
          plaidHostedLinkConfig,
        ),
      t('linkedAccounts:useLinkedAccounts.error.repair_connection', 'We couldn’t repair the Plaid connection with your account. Please try again.'),
    ),
    [fetchLinkToken, withHostedLinkRedirect, triggerCreatePlaidUpdateModeLink, plaidHostedLinkConfig, customerManagedPlaidConfig, t],
  )

  const addConnection = usePlaidOnlyAction('Adding a connection', fetchPlaidLinkToken)

  const repairConnection = usePlaidOnlyAction('Repairing a connection', fetchPlaidUpdateModeLinkToken)

  const handleRemoveConnection = useCallback(
    (connectionExternalId: string) => mutateAndRefetchWithToast(
      () => triggerUnlinkPlaidItem({ plaidItemId: connectionExternalId }),
      t('linkedAccounts:useLinkedAccounts.error.remove_connection', 'We couldn’t remove this connection. Please try again.'),
    ),
    [mutateAndRefetchWithToast, triggerUnlinkPlaidItem, t],
  )
  const removeConnection = usePlaidOnlyAction(
    'Removing a connection',
    useLayerOwnedItemAction('Removing a connection', customerManagedPlaidConfig != null, handleRemoveConnection),
  )

  const handleConfirmAccount = useCallback(
    (accountId: string) => mutateAndRefetchWithToast(
      () => triggerConfirmExternalAccount({ accountId }),
      t('linkedAccounts:useLinkedAccounts.error.confirm_account', 'We couldn’t confirm your account. Please try again.'),
    ),
    [mutateAndRefetchWithToast, triggerConfirmExternalAccount, t],
  )
  const confirmAccount = usePlaidOnlyAction('Confirming an account', handleConfirmAccount)

  const handleExcludeAccount = useCallback(
    (accountId: string) => mutateAndRefetchWithToast(
      () => triggerExcludeExternalAccount({ accountId, body: { is_duplicate: true } }),
      t('linkedAccounts:useLinkedAccounts.error.exclude_account', 'We couldn’t exclude your account. Please try again.'),
    ),
    [mutateAndRefetchWithToast, triggerExcludeExternalAccount, t],
  )
  const excludeAccount = usePlaidOnlyAction('Excluding an account', handleExcludeAccount)

  const handleBreakConnection = useCallback(
    (connectionExternalId: string) => mutateAndRefetchWithToast(
      () => triggerBreakPlaidItemConnection({ plaidItemId: connectionExternalId }),
      t('linkedAccounts:useLinkedAccounts.error.break_connection', 'We couldn’t reset this connection. Please try again.'),
    ),
    [mutateAndRefetchWithToast, triggerBreakPlaidItemConnection, t],
  )
  /**
   * Test utility that puts a connection into a broken state; only works in non-production
   * environments.
   */
  const breakConnection = usePlaidOnlyAction(
    'Breaking a sandbox connection',
    useLayerOwnedItemAction('Breaking a sandbox connection', customerManagedPlaidConfig != null, handleBreakConnection),
  )

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
