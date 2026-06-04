import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type LoadedStatus } from '@internal-types/general'
import { type AccountSource, type BankAccount, type ExternalAccountConnection } from '@internal-types/linkedAccounts'
import { useListBankAccounts } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { useUnlinkBankAccount } from '@hooks/api/businesses/[business-id]/bank-accounts/useUnlinkBankAccount'
import { useConfirmExternalAccount } from '@hooks/api/businesses/[business-id]/external-accounts/[external-account-id]/confirm'
import { useExcludeExternalAccount } from '@hooks/api/businesses/[business-id]/external-accounts/[external-account-id]/exclude'
import { useBreakPlaidItemConnection } from '@hooks/api/businesses/[business-id]/plaid/items/[plaid-item-id]/sandbox-reset-item-login'
import { useUnlinkPlaidItem } from '@hooks/api/businesses/[business-id]/plaid/items/[plaid-item-id]/unlink'
import { useCreatePlaidLink } from '@hooks/api/businesses/[business-id]/plaid/link'
import { useCreatePlaidUpdateModeLink } from '@hooks/api/businesses/[business-id]/plaid/update-mode-link'
import { type LinkMode, usePlaidLinkModal } from '@hooks/features/linkedAccounts/usePlaidLinkModal'
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
  const { addToast } = useLayerContext()
  const { t } = useTranslation()

  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')
  const [linkMode, setLinkMode] = useState<LinkMode>('add')

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
  const { trigger: triggerConfirmExternalAccount } = useConfirmExternalAccount()
  const { trigger: triggerExcludeExternalAccount } = useExcludeExternalAccount()
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
   *
   * Note: this swallows rejections (the failure becomes a toast and the returned
   * promise resolves), so it must not back an `onConfirm`/submit handler whose
   * caller relies on a rejection to show errors — e.g. BaseConfirmationModal.
   */
  const mutateAndRefetchAccountsWithToast = useCallback(
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
      t('linkedAccounts:error.start_connection', 'We couldn’t start connecting your account. Please try again.'),
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
      t('linkedAccounts:error.repair_connection', 'We couldn’t start reconnecting your account. Please try again.'),
    ),
    [fetchLinkToken, triggerCreatePlaidUpdateModeLink, t],
  )

  const { isLinking } = usePlaidLinkModal({
    token: linkToken,
    onSuccess: refetchAccounts,
    linkMode,
    setLinkMode,
  })

  const addConnection = usePlaidOnlyAction('Adding a connection', fetchPlaidLinkToken)

  const repairConnection = usePlaidOnlyAction('Repairing a connection', fetchPlaidUpdateModeLinkToken)

  const handleRemoveConnection = useCallback(
    (connectionExternalId: string) => mutateAndRefetchAccountsWithToast(
      () => triggerUnlinkPlaidItem({ plaidItemId: connectionExternalId }),
      t('linkedAccounts:error.remove_connection', 'We couldn’t remove this connection. Please try again.'),
    ),
    [mutateAndRefetchAccountsWithToast, triggerUnlinkPlaidItem, t],
  )
  const removeConnection = usePlaidOnlyAction('Removing a connection', handleRemoveConnection)

  const handleConfirmAccount = useCallback(
    (accountId: string) => mutateAndRefetchAccountsWithToast(
      () => triggerConfirmExternalAccount({ accountId }),
      t('linkedAccounts:error.confirm_account', 'We couldn’t confirm your account. Please try again.'),
    ),
    [mutateAndRefetchAccountsWithToast, triggerConfirmExternalAccount, t],
  )
  const confirmAccount = usePlaidOnlyAction('Confirming an account', handleConfirmAccount)

  const handleExcludeAccount = useCallback(
    (accountId: string) => mutateAndRefetchAccountsWithToast(
      () => triggerExcludeExternalAccount({ accountId, body: { is_duplicate: true } }),
      t('linkedAccounts:error.exclude_account', 'We couldn’t exclude your account. Please try again.'),
    ),
    [mutateAndRefetchAccountsWithToast, triggerExcludeExternalAccount, t],
  )
  const excludeAccount = usePlaidOnlyAction('Excluding an account', handleExcludeAccount)

  const handleBreakConnection = useCallback(
    (connectionExternalId: string) => mutateAndRefetchAccountsWithToast(
      () => triggerBreakPlaidItemConnection({ plaidItemId: connectionExternalId }),
      t('linkedAccounts:error.break_connection', 'We couldn’t reset this connection. Please try again.'),
    ),
    [mutateAndRefetchAccountsWithToast, triggerBreakPlaidItemConnection, t],
  )
  /**
   * Test utility that puts a connection into a broken state; only works in non-production
   * environments.
   */
  const breakConnection = usePlaidOnlyAction('Breaking a sandbox connection', handleBreakConnection)

  // Note: not routed through mutateAndRefetchAccountsWithToast — this is confirmed via
  // BaseConfirmationModal, which surfaces failures (errorText + Retry, stays
  // open) by catching a rejected onConfirm. Swallowing the error into a toast
  // would let the modal dismiss as if the unlink succeeded.
  const unlinkBankAccount = useCallback(
    async (bankAccountId: string) => {
      await triggerUnlinkBankAccount(bankAccountId)
      await refetchAccounts()
    },
    [triggerUnlinkBankAccount, refetchAccounts],
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
