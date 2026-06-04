import { useEffect, useState } from 'react'
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
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useAccountConfirmationStoreActions } from '@providers/AccountConfirmationStoreProvider'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'

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

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const { usePlaidSandbox } = useEnvironment()
  const { data: auth } = useAuth()
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

  /**
   * Initiates an add connection flow with Plaid
   */
  const fetchPlaidLinkToken = async () => {
    if (auth?.access_token) {
      const result = await triggerCreatePlaidLink({})
      if (!result) return

      setLinkMode('add')
      setLinkToken(result.linkToken)
    }
  }

  /**
   * Initiates a connection repair flow with Plaid
   */
  const fetchPlaidUpdateModeLinkToken = async (plaidItemPlaidId: string) => {
    if (auth?.access_token) {
      const result = await triggerCreatePlaidUpdateModeLink({ plaidItemId: plaidItemPlaidId })
      if (!result) return

      setLinkMode('update')
      setLinkToken(result.linkToken)
    }
  }

  /**
   * When the user has finished entering credentials, send the resulting
   * token to the backend where it will fetch and save the Plaid access token
   * and item id
   * */
  const exchangePlaidPublicToken = async (
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata,
  ) => {
    setIsLinking(true)
    preloadAccountConfirmation()

    try {
      await triggerExchangePlaidPublicToken({
        public_token: publicToken,
        institution: metadata.institution,
      })
      await refetchAccounts()
    }
    finally {
      setIsLinking(false)
      resetAccountConfirmation()
    }
  }

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

  const addConnection = async (source: AccountSource) => {
    if (source === 'PLAID') {
      await fetchPlaidLinkToken()
    }
    else {
      console.error(
        `Adding a connection with source ${source} not yet supported`,
      )
    }
  }

  const repairConnection = async (
    source: AccountSource,
    connectionExternalId: string,
  ) => {
    if (source === 'PLAID') {
      await fetchPlaidUpdateModeLinkToken(connectionExternalId)
    }
    else {
      console.error(
        `Repairing a connection with source ${source} not yet supported`,
      )
    }
  }

  const removeConnection = async (
    source: AccountSource,
    connectionExternalId: string,
  ) => {
    if (source === 'PLAID') {
      await unlinkPlaidItem(connectionExternalId)
      await refetchAccounts()
    }
    else {
      console.error(
        `Removing a connection with source ${source} not yet supported`,
      )
    }
  }

  const unlinkBankAccount = async (bankAccountId: string) => {
    await triggerUnlinkBankAccount(bankAccountId)
    await refetchAccounts()
  }

  const confirmAccount = async (source: AccountSource, accountId: string) => {
    if (source === 'PLAID') {
      await triggerConfirmExternalAccount({ accountId })
      await refetchAccounts()
    }
    else {
      console.error(
        `Confirming an account with source ${source} not yet supported`,
      )
    }
  }

  const excludeAccount = async (source: AccountSource, accountId: string) => {
    if (source === 'PLAID') {
      await triggerExcludeExternalAccount({
        accountId,
        body: { is_duplicate: true },
      })
      await refetchAccounts()
    }
    else {
      console.error(
        `Excluding an account with source ${source} not yet supported`,
      )
    }
  }

  /**
   * Test utility that puts a connection into a broken state; only works in non-production
   * environments.
   */
  const breakConnection = async (
    source: AccountSource,
    connectionExternalId: string,
  ) => {
    if (source === 'PLAID') {
      await triggerBreakPlaidItemConnection({ plaidItemId: connectionExternalId })
      await refetchAccounts()
    }
    else {
      console.error(
        `Breaking a sandbox connection with source ${source} not yet supported`,
      )
    }
  }

  const refetchAccounts = async () => {
    await mutate()
  }

  const unlinkPlaidItem = async (plaidItemPlaidId: string) => {
    await triggerUnlinkPlaidItem({ plaidItemId: plaidItemPlaidId })
    await refetchAccounts()
  }

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
