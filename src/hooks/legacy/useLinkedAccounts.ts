import { useEffect, useRef, useState } from 'react'
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

const PLAID_OAUTH_SESSION_KEY = 'layer_plaid_oauth_session'

function persistPlaidSession(linkToken: string, linkMode: LinkMode) {
  try {
    sessionStorage.setItem(
      PLAID_OAUTH_SESSION_KEY,
      JSON.stringify({ linkToken, linkMode }),
    )
  }
  catch { /* best-effort */ }
}

function restorePlaidSession(): { linkToken: string, linkMode: LinkMode } | null {
  try {
    const raw = sessionStorage.getItem(PLAID_OAUTH_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { linkToken?: string, linkMode?: string }
    if (typeof parsed.linkToken === 'string' && parsed.linkToken) {
      return {
        linkToken: parsed.linkToken,
        linkMode: parsed.linkMode === 'update' ? 'update' : 'add',
      }
    }
  }
  catch { /* best-effort */ }
  return null
}

function clearPlaidSession() {
  try {
    sessionStorage.removeItem(PLAID_OAUTH_SESSION_KEY)
  }
  catch { /* best-effort */ }
}

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const {
    businessId,
    touch,
    read,
    syncTimestamps,
    hasBeenTouched,
  } = useLayerContext()

  const {
    apiUrl,
    usePlaidSandbox,
    plaidRedirectUri,
    plaidReceivedRedirectUri,
    onPlaidOAuthResumeComplete,
  } = useEnvironment()
  const { data: auth } = useAuth()
  const {
    preload: preloadAccountConfirmation,
    reset: resetAccountConfirmation,
  } = useAccountConfirmationStoreActions()

  const restoredSession = plaidReceivedRedirectUri ? restorePlaidSession() : null

  const [linkToken, setLinkToken] = useState<string | null>(restoredSession?.linkToken ?? null)
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')
  const [linkMode, setLinkMode] = useState<LinkMode>(restoredSession?.linkMode ?? 'add')
  const [isLinking, setIsLinking] = useState(false)
  const [oAuthConsumed, setOAuthConsumed] = useState(false)
  const [accountsToAddOpeningBalanceInModal, setAccountsToAddOpeningBalanceInModal] =
    useState<BankAccount[]>([])

  const authRef = useRef(auth)
  useEffect(() => {
    authRef.current = auth
  }, [auth])

  const queryKey = businessId && auth?.access_token && `linked-accounts-${businessId}`

  const {
    data: bankAccounts,
    isLoading,
    isValidating,
    error: responseError,
    mutate,
  } = useListBankAccounts()

  const { trigger: triggerUnlinkBankAccount } = useUnlinkBankAccount()

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
      const linkToken = (
        await getPlaidLinkToken(apiUrl, auth.access_token, {
          params: { businessId },
          ...(plaidRedirectUri ? { body: { redirect_uri: plaidRedirectUri } } : {}),
        })
      ).data.link_token
      setOAuthConsumed(false)
      setLinkMode('add')
      setLinkToken(linkToken)
      if (plaidRedirectUri) {
        persistPlaidSession(linkToken, 'add')
      }
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
          body: { plaid_item_id: plaidItemPlaidId, ...(plaidRedirectUri ? { redirect_uri: plaidRedirectUri } : {}) },
        })
      ).data.link_token
      setOAuthConsumed(false)
      setLinkMode('update')
      setLinkToken(linkToken)
      if (plaidRedirectUri) {
        persistPlaidSession(linkToken, 'update')
      }
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
    const accessToken = authRef.current?.access_token
    if (!accessToken) {
      console.error('[useLinkedAccounts] No access token available for public token exchange')
      return
    }

    setIsLinking(true)
    preloadAccountConfirmation()

    try {
      await exchangePlaidPublicTokenApi(apiUrl, accessToken, {
        params: { businessId },
        body: { public_token: publicToken, institution: metadata.institution },
      })
      await refetchAccounts()
    }
    finally {
      setIsLinking(false)
      resetAccountConfirmation()
    }
  }

  const activeReceivedRedirectUri = (!oAuthConsumed && plaidReceivedRedirectUri) || undefined

  const resetPlaidLinkState = () => {
    const isOAuthResumeFlow = Boolean(activeReceivedRedirectUri)
    clearPlaidSession()
    setOAuthConsumed(true)
    setLinkToken(null)
    setLinkMode('add')

    if (isOAuthResumeFlow) {
      try {
        onPlaidOAuthResumeComplete?.()
      }
      catch (error) {
        console.error('[useLinkedAccounts] onPlaidOAuthResumeComplete callback failed:', error)
      }
    }
  }

  const { open: plaidLinkStart, ready: plaidLinkReady } = usePlaidLink({
    token: linkToken,
    receivedRedirectUri: activeReceivedRedirectUri,

    onSuccess: (
      publicToken: string,
      metadata: PlaidLinkOnSuccessMetadata,
    ) => {
      resetPlaidLinkState()
      if (linkMode == 'add') {
        exchangePlaidPublicToken(publicToken, metadata).catch((err) => {
          console.error('[useLinkedAccounts] Public token exchange failed:', err)
        })
      }
      else {
        updateConnectionStatus().then(() => {
          void refetchAccounts()
          touch(DataModel.LINKED_ACCOUNTS)
        }).catch((err) => {
          console.error('[useLinkedAccounts] Update connection status failed:', err)
        })
      }
    },
    onExit: () => {
      resetPlaidLinkState()
    },
    env: usePlaidSandbox ? 'sandbox' : undefined,
  })

  useEffect(() => {
    if (plaidLinkReady && auth?.access_token) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      plaidLinkStart()
    }
  }, [plaidLinkStart, plaidLinkReady, auth?.access_token])

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

  const refetchAccounts = async () => {
    await mutate()
  }

  const syncAccounts = async () => {
    await syncConnection(apiUrl, auth?.access_token, {
      params: { businessId },
    })
  }

  const updateConnectionStatus = async () => {
    await updateConnectionStatusApi(apiUrl, authRef.current?.access_token, {
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
