import { useCallback, useEffect, useState } from 'react'
import { type PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link'

import { DataModel, type LoadedStatus } from '@internal-types/general'
import type { PublicToken } from '@internal-types/linkedAccounts'
import { type AccountSource, type BankAccount, type ExternalAccountConnection } from '@internal-types/linkedAccounts'
import type { OneOf } from '@internal-types/utility/oneOf'
import { post } from '@utils/api/authenticatedHttp'
import { useListBankAccounts } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { useUnlinkBankAccount } from '@hooks/api/businesses/[business-id]/bank-accounts/useUnlinkBankAccount'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useAccountConfirmationStoreActions } from '@providers/AccountConfirmationStoreProvider'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const getPlaidLinkToken = post<
  { data: { type: 'Link_Token', link_token: string } },
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link`)

const getPlaidUpdateModeLinkToken = post<
  { data: { type: 'Link_Token', link_token: string } },
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/update-mode-link`)

const exchangePlaidPublicTokenApi = post<
  Record<string, unknown>,
  PublicToken,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link/exchange`)

export type ConfirmAccountBodyStrict = OneOf<[
  { is_unique: true },
  { is_relevant: true },
]>

export const confirmAccountApi = post<
  never,
  ConfirmAccountBodyStrict,
  { businessId: string, accountId: string }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/external-accounts/${accountId}/confirm`,
)

export type ExcludeAccountBodyStrict = OneOf<[
  { is_irrelevant: true },
  { is_duplicate: true },
]>

export const excludeAccountApi = post<
  never,
  ExcludeAccountBodyStrict,
  { businessId: string, accountId: string }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/external-accounts/${accountId}/exclude`,
)

const breakPlaidItemConnection = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string, plaidItemPlaidId: string }
>(
  ({ businessId, plaidItemPlaidId }) =>
    `/v1/businesses/${businessId}/plaid/items/${plaidItemPlaidId}/sandbox-reset-item-login`,
)

const syncConnection = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/sync`)

const updateConnectionStatusApi = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string }
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/external-accounts/update-connection-status`,
)

const unlinkPlaidItemApi = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string, plaidItemPlaidId: string }
>(
  ({ businessId, plaidItemPlaidId }) =>
    `/v1/businesses/${businessId}/plaid/items/${plaidItemPlaidId}/unlink`,
)

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
  updateConnectionStatus: () => Promise<void>
  refetchAccounts: () => Promise<void>
  syncAccounts: () => Promise<void>
  unlinkBankAccount: (bankAccountId: string) => Promise<void>
  confirmAccount: (source: AccountSource, accountId: string) => Promise<void>
  excludeAccount: (source: AccountSource, accountId: string) => Promise<void>
  accountsToAddOpeningBalanceInModal: BankAccount[]
  setAccountsToAddOpeningBalanceInModal: (accounts: BankAccount[]) => void

  // Only works in non-production environments for test purposes
  breakConnection: (source: AccountSource, connectionExternalId: string) => Promise<void>
}

type LinkMode = 'update' | 'add'
type PendingPlaidSuccess = {
  publicToken: string
  metadata: PlaidLinkOnSuccessMetadata
}

const PLAID_LINK_TOKEN_STORAGE_KEY = 'plaid_link_token'
const PLAID_LINK_MODE_STORAGE_KEY = 'plaid_link_mode'

function getPlaidStorageKey(key: string, businessId: string) {
  return `${key}:${businessId}`
}

function readStoredPlaidLinkToken(businessId: string) {
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage.getItem(getPlaidStorageKey(PLAID_LINK_TOKEN_STORAGE_KEY, businessId))
  }
  catch {
    return null
  }
}

function readStoredPlaidLinkMode(businessId: string): LinkMode {
  if (typeof window === 'undefined') return 'add'

  try {
    const storedMode = window.sessionStorage.getItem(getPlaidStorageKey(PLAID_LINK_MODE_STORAGE_KEY, businessId))
    return storedMode === 'update' ? 'update' : 'add'
  }
  catch {
    return 'add'
  }
}

function writeStoredPlaidLinkState(businessId: string, linkToken: string, linkMode: LinkMode) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(getPlaidStorageKey(PLAID_LINK_TOKEN_STORAGE_KEY, businessId), linkToken)
    window.sessionStorage.setItem(getPlaidStorageKey(PLAID_LINK_MODE_STORAGE_KEY, businessId), linkMode)
  }
  catch {
    return
  }
}

function clearStoredPlaidLinkState(businessId: string) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.removeItem(getPlaidStorageKey(PLAID_LINK_TOKEN_STORAGE_KEY, businessId))
    window.sessionStorage.removeItem(getPlaidStorageKey(PLAID_LINK_MODE_STORAGE_KEY, businessId))
  }
  catch {
    return
  }
}

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const {
    businessId,
    touch,
    read,
    syncTimestamps,
    hasBeenTouched,
  } = useLayerContext()

  const { apiUrl, usePlaidSandbox, plaidRedirectUri, plaidReceivedRedirectUri } = useEnvironment()
  console.debug('[PlaidDiag] useLinkedAccounts env:', { plaidRedirectUri, plaidReceivedRedirectUri, usePlaidSandbox })
  const { data: auth } = useAuth()
  const {
    preload: preloadAccountConfirmation,
    reset: resetAccountConfirmation,
  } = useAccountConfirmationStoreActions()

  const [linkToken, setLinkToken] = useState<string | null>(() =>
    plaidReceivedRedirectUri ? readStoredPlaidLinkToken(businessId) : null,
  )
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')
  const [linkMode, setLinkMode] = useState<LinkMode>(() =>
    plaidReceivedRedirectUri ? readStoredPlaidLinkMode(businessId) : 'add',
  )
  const [isLinking, setIsLinking] = useState(false)
  const [pendingPlaidSuccess, setPendingPlaidSuccess] = useState<PendingPlaidSuccess | null>(null)
  const [activeReceivedRedirectUri, setActiveReceivedRedirectUri] = useState(plaidReceivedRedirectUri)
  const [accountsToAddOpeningBalanceInModal, setAccountsToAddOpeningBalanceInModal] =
    useState<BankAccount[]>([])

  const queryKey = businessId && auth?.access_token && `linked-accounts-${businessId}`

  const {
    data: bankAccounts,
    isLoading,
    isValidating,
    error: responseError,
    mutate,
  } = useListBankAccounts()

  const { trigger: triggerUnlinkBankAccount } = useUnlinkBankAccount()

  const refetchAccounts = useCallback(async () => {
    await mutate()
  }, [mutate])

  useEffect(() => {
    if (!plaidReceivedRedirectUri) {
      return
    }

    const storedLinkToken = readStoredPlaidLinkToken(businessId)
    setLinkToken(storedLinkToken)
    setLinkMode(storedLinkToken ? readStoredPlaidLinkMode(businessId) : 'add')
  }, [businessId, plaidReceivedRedirectUri])

  useEffect(() => {
    if (linkToken) {
      writeStoredPlaidLinkState(businessId, linkToken, linkMode)
      return
    }

    clearStoredPlaidLinkState(businessId)
  }, [businessId, linkMode, linkToken])

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
      const requestBody = plaidRedirectUri ? { redirect_uri: plaidRedirectUri } : undefined
      console.debug('[PlaidDiag] fetchPlaidLinkToken request:', { businessId, body: requestBody })
      const linkToken = (
        await getPlaidLinkToken(apiUrl, auth.access_token, {
          params: { businessId },
          ...(requestBody ? { body: requestBody } : {}),
        })
      ).data.link_token
      console.debug('[PlaidDiag] fetchPlaidLinkToken received token:', linkToken ? 'yes' : 'no')
      setLinkMode('add')
      setLinkToken(linkToken)
    }
  }

  /**
   * Initiates a connection repair flow with Plaid
   */
  const fetchPlaidUpdateModeLinkToken = async (plaidItemPlaidId: string) => {
    if (auth?.access_token) {
      const linkToken = (
        await getPlaidUpdateModeLinkToken(apiUrl, auth.access_token, {
          params: { businessId },
          body: {
            plaid_item_id: plaidItemPlaidId,
            ...(plaidRedirectUri ? { redirect_uri: plaidRedirectUri } : {}),
          },
        })
      ).data.link_token
      setLinkMode('update')
      setLinkToken(linkToken)
    }
  }

  /**
   * When the user has finished entering credentials, send the resulting
   * token to the backend where it will fetch and save the Plaid access token
   * and item id
   * */
  const exchangePlaidPublicToken = useCallback(async (
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata,
  ) => {
    setIsLinking(true)
    preloadAccountConfirmation()
    let currentStep: 'exchange' | 'refetchAccounts' = 'exchange'

    try {
      console.debug('[PlaidDiag] exchangePlaidPublicToken start:', {
        businessId,
        hasAccessToken: !!auth?.access_token,
        hasPublicToken: !!publicToken,
        institution: metadata.institution?.name ?? 'unknown',
      })
      await exchangePlaidPublicTokenApi(apiUrl, auth?.access_token, {
        params: { businessId },
        body: { public_token: publicToken, institution: metadata.institution },
      })
      console.debug('[PlaidDiag] exchangePlaidPublicToken exchange succeeded')
      currentStep = 'refetchAccounts'
      console.debug('[PlaidDiag] exchangePlaidPublicToken refetch starting')
      await refetchAccounts()
      console.debug('[PlaidDiag] exchangePlaidPublicToken refetch succeeded')
      setLinkToken(null)
      setLinkMode('add')
    }
    catch (error) {
      console.error('[PlaidDiag] exchangePlaidPublicToken failed:', {
        step: currentStep,
        businessId,
        hasAccessToken: !!auth?.access_token,
        error,
      })
      throw error
    }
    finally {
      setIsLinking(false)
      resetAccountConfirmation()
    }
  }, [
    apiUrl,
    auth?.access_token,
    businessId,
    preloadAccountConfirmation,
    refetchAccounts,
    resetAccountConfirmation,
  ])

  useEffect(() => {
    if (!pendingPlaidSuccess || !auth?.access_token) {
      return
    }

    console.debug('[PlaidDiag] exchangePlaidPublicToken resuming with auth token')
    const queuedPlaidSuccess = pendingPlaidSuccess
    setPendingPlaidSuccess(null)
    void exchangePlaidPublicToken(queuedPlaidSuccess.publicToken, queuedPlaidSuccess.metadata).catch(() => undefined)
  }, [auth?.access_token, exchangePlaidPublicToken, pendingPlaidSuccess])

  console.debug('[PlaidDiag] usePlaidLink config:', { hasToken: !!linkToken, receivedRedirectUri: activeReceivedRedirectUri ?? 'none' })
  const { open: plaidLinkStart, ready: plaidLinkReady } = usePlaidLink({
    token: linkToken,
    receivedRedirectUri: activeReceivedRedirectUri ?? undefined,

    // If in update mode, we don't need to exchange the public token for an access token.
    // The existing access token will automatically become valid again
    onSuccess: (
      publicToken: string,
      metadata: PlaidLinkOnSuccessMetadata,
    ) => {
      setActiveReceivedRedirectUri(undefined)

      if (linkMode == 'add') {
        if (!auth?.access_token) {
          console.debug('[PlaidDiag] exchangePlaidPublicToken waiting for auth token')
          setPendingPlaidSuccess({ publicToken, metadata })
          return
        }

        // Note: a sync is kicked off in the backend in this endpoint
        void exchangePlaidPublicToken(publicToken, metadata).catch(() => undefined)
      }
      else {
        // Refresh the account connections, which should remove the error
        // pills from any broken accounts
        void updateConnectionStatus().then(() => {
          void refetchAccounts()
          setLinkToken(null)
          setLinkMode('add')
          touch(DataModel.LINKED_ACCOUNTS)
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
    touch(DataModel.LINKED_ACCOUNTS)
  }

  const confirmAccount = async (source: AccountSource, accountId: string) => {
    if (source === 'PLAID') {
      await confirmAccountApi(apiUrl, auth?.access_token, {
        params: {
          businessId,
          accountId,
        },
      })
      await refetchAccounts()
      touch(DataModel.LINKED_ACCOUNTS)
    }
    else {
      console.error(
        `Confirming an account with source ${source} not yet supported`,
      )
    }
  }

  const excludeAccount = async (source: AccountSource, accountId: string) => {
    if (source === 'PLAID') {
      await excludeAccountApi(apiUrl, auth?.access_token, {
        params: {
          businessId,
          accountId,
        },
        body: {
          is_duplicate: true,
        },
      })
      await refetchAccounts()
      touch(DataModel.LINKED_ACCOUNTS)
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
      await breakPlaidItemConnection(apiUrl, auth?.access_token, {
        params: {
          businessId,
          plaidItemPlaidId: connectionExternalId,
        },
      })
      await refetchAccounts()
      touch(DataModel.LINKED_ACCOUNTS)
    }
    else {
      console.error(
        `Breaking a sandbox connection with source ${source} not yet supported`,
      )
    }
  }

  const syncAccounts = async () => {
    await syncConnection(apiUrl, auth?.access_token, {
      params: { businessId },
    })
  }

  const updateConnectionStatus = async () => {
    await updateConnectionStatusApi(apiUrl, auth?.access_token, {
      params: { businessId },
    })
  }

  const unlinkPlaidItem = async (plaidItemPlaidId: string) => {
    await unlinkPlaidItemApi(apiUrl, auth?.access_token, {
      params: { businessId, plaidItemPlaidId },
    })
    await refetchAccounts()
    touch(DataModel.LINKED_ACCOUNTS)
  }

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (queryKey && (isLoading || isValidating)) {
      read(DataModel.LINKED_ACCOUNTS, queryKey)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isValidating])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      void refetchAccounts()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncTimestamps])

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
    syncAccounts,
    updateConnectionStatus,
    accountsToAddOpeningBalanceInModal,
    setAccountsToAddOpeningBalanceInModal,
  }
}
