import { useEffect, useState } from 'react'
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

type PlaidLinkTokenData = {
  type: 'Link_Token'
  link_token: string
  hosted_link_url?: string | null
}

type PlaidLinkTokenGetData = {
  type: 'Plaid_Link_Token_Get'
  status: 'pending' | 'success' | 'exit'
  public_token?: string | null
}

type LinkMode = 'update' | 'add'

type HostedLinkSession = {
  mode: LinkMode
  businessId: string
  linkToken: string
  startedAtMs: number
}

type HostedLinkRuntimeConfig = {
  completionRedirectUri?: string
  isMobileApp?: boolean
  redirectUri?: string
}

const HOSTED_LINK_SESSION_STORAGE_KEY = 'layer-plaid-hosted-link-session'
const HOSTED_LINK_POLL_LOCK_STORAGE_KEY = 'layer-plaid-hosted-link-poll-lock'
const HOSTED_LINK_POLL_INTERVAL_MS = 1500
const HOSTED_LINK_POLL_TIMEOUT_MS = 120000
const HOSTED_LINK_POLL_LOCK_TIMEOUT_MS = 180000

let hostedLinkPollLockFallbackId: string | null = null

function isBrowserSessionStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function getHostedLinkCompletionRedirectUri() {
  if (typeof window === 'undefined') {
    return null
  }

  const currentUrl = new URL(window.location.href)
  currentUrl.hash = ''

  const pathSegments = currentUrl.pathname.split('/').filter(Boolean)
  if (pathSegments.length > 1) {
    pathSegments[pathSegments.length - 1] = 'plaid-hosted-link-callback'
    currentUrl.pathname = `/${pathSegments.join('/')}`
  }
  else if (pathSegments.length === 1) {
    currentUrl.pathname = `/${pathSegments[0]}/plaid-hosted-link-callback`
  }
  else {
    currentUrl.pathname = '/plaid-hosted-link-callback'
  }

  const returnTo = `${window.location.pathname}${window.location.search}`
  currentUrl.search = new URLSearchParams({ return_to: returnTo }).toString()

  return currentUrl.toString()
}

function readHostedLinkRuntimeConfig() {
  if (typeof window === 'undefined') {
    return null
  }

  const config = (window as typeof window & { __LAYER_PLAID_HOSTED_LINK_CONFIG__?: unknown }).__LAYER_PLAID_HOSTED_LINK_CONFIG__
  if (!config || typeof config !== 'object') {
    return null
  }

  const candidate = config as Record<string, unknown>
  const completionRedirectUri = typeof candidate.completionRedirectUri === 'string' && candidate.completionRedirectUri.trim()
    ? candidate.completionRedirectUri.trim()
    : undefined
  const redirectUri = typeof candidate.redirectUri === 'string' && candidate.redirectUri.trim()
    ? candidate.redirectUri.trim()
    : undefined
  const isMobileApp = typeof candidate.isMobileApp === 'boolean'
    ? candidate.isMobileApp
    : undefined

  const hasValues = completionRedirectUri !== undefined || redirectUri !== undefined || isMobileApp !== undefined
  if (!hasValues) {
    return null
  }

  const parsed: HostedLinkRuntimeConfig = {}
  if (completionRedirectUri !== undefined) {
    parsed.completionRedirectUri = completionRedirectUri
  }
  if (redirectUri !== undefined) {
    parsed.redirectUri = redirectUri
  }
  if (isMobileApp !== undefined) {
    parsed.isMobileApp = isMobileApp
  }

  return parsed
}

function buildHostedLinkRequestBody(usePlaidHostedLink: boolean) {
  if (!usePlaidHostedLink) {
    return null
  }

  const runtimeConfig = readHostedLinkRuntimeConfig()
  const completionRedirectUri = runtimeConfig?.completionRedirectUri ?? getHostedLinkCompletionRedirectUri()
  const isMobileApp = runtimeConfig?.isMobileApp ?? false
  const redirectUri = runtimeConfig?.redirectUri

  return {
    ...(completionRedirectUri ? { completion_redirect_uri: completionRedirectUri } : {}),
    is_mobile_app: isMobileApp,
    ...(redirectUri ? { redirect_uri: redirectUri } : {}),
  }
}

function saveHostedLinkSession(session: HostedLinkSession) {
  if (!isBrowserSessionStorageAvailable()) {
    return
  }

  try {
    window.sessionStorage.setItem(
      HOSTED_LINK_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    )
  }
  catch {
    return
  }
}

function readHostedLinkSession() {
  if (!isBrowserSessionStorageAvailable()) {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(HOSTED_LINK_SESSION_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<HostedLinkSession>
    if (
      (parsed.mode !== 'add' && parsed.mode !== 'update')
      || typeof parsed.businessId !== 'string'
      || typeof parsed.linkToken !== 'string'
      || typeof parsed.startedAtMs !== 'number'
    ) {
      window.sessionStorage.removeItem(HOSTED_LINK_SESSION_STORAGE_KEY)
      return null
    }
    return parsed as HostedLinkSession
  }
  catch {
    return null
  }
}

function clearHostedLinkSession() {
  if (!isBrowserSessionStorageAvailable()) {
    return
  }

  try {
    window.sessionStorage.removeItem(HOSTED_LINK_SESSION_STORAGE_KEY)
  }
  catch {
    return
  }
}

function acquireHostedLinkPollLock() {
  const lockId = `${Date.now()}-${Math.random().toString(16).slice(2)}`

  if (!isBrowserSessionStorageAvailable()) {
    if (hostedLinkPollLockFallbackId) {
      return null
    }
    hostedLinkPollLockFallbackId = lockId
    return lockId
  }

  try {
    const rawExistingLock = window.sessionStorage.getItem(HOSTED_LINK_POLL_LOCK_STORAGE_KEY)
    if (rawExistingLock) {
      const existingLock = JSON.parse(rawExistingLock) as {
        id?: string
        acquiredAtMs?: number
      }

      if (
        typeof existingLock.id === 'string'
        && typeof existingLock.acquiredAtMs === 'number'
        && Date.now() - existingLock.acquiredAtMs < HOSTED_LINK_POLL_LOCK_TIMEOUT_MS
      ) {
        return null
      }

      window.sessionStorage.removeItem(HOSTED_LINK_POLL_LOCK_STORAGE_KEY)
    }

    const nextLock = {
      id: lockId,
      acquiredAtMs: Date.now(),
    }
    const serializedNextLock = JSON.stringify(nextLock)
    window.sessionStorage.setItem(HOSTED_LINK_POLL_LOCK_STORAGE_KEY, serializedNextLock)

    if (window.sessionStorage.getItem(HOSTED_LINK_POLL_LOCK_STORAGE_KEY) !== serializedNextLock) {
      return null
    }

    return lockId
  }
  catch {
    if (hostedLinkPollLockFallbackId) {
      return null
    }
    hostedLinkPollLockFallbackId = lockId
    return lockId
  }
}

function releaseHostedLinkPollLock(lockId: string) {
  if (!isBrowserSessionStorageAvailable()) {
    if (hostedLinkPollLockFallbackId === lockId) {
      hostedLinkPollLockFallbackId = null
    }
    return
  }

  try {
    const rawLock = window.sessionStorage.getItem(HOSTED_LINK_POLL_LOCK_STORAGE_KEY)
    if (!rawLock) {
      return
    }
    const lock = JSON.parse(rawLock) as { id?: string }
    if (lock.id === lockId) {
      window.sessionStorage.removeItem(HOSTED_LINK_POLL_LOCK_STORAGE_KEY)
    }
  }
  catch {
    if (hostedLinkPollLockFallbackId === lockId) {
      hostedLinkPollLockFallbackId = null
    }
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

const getPlaidLinkToken = post<
  { data: PlaidLinkTokenData },
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link`)

const getPlaidUpdateModeLinkToken = post<
  { data: PlaidLinkTokenData },
  Record<string, unknown>,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/update-mode-link`)

const getPlaidLinkTokenState = post<
  { data: PlaidLinkTokenGetData },
  { link_token: string },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link/token/get`)

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

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const {
    businessId,
    touch,
    read,
    syncTimestamps,
    hasBeenTouched,
    openExternalAuth,
  } = useLayerContext()

  const { apiUrl, usePlaidSandbox, usePlaidHostedLink } = useEnvironment()
  const { data: auth } = useAuth()
  const {
    preload: preloadAccountConfirmation,
    reset: resetAccountConfirmation,
  } = useAccountConfirmationStoreActions()

  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')
  const [linkMode, setLinkMode] = useState<LinkMode>('add')
  const [isLinking, setIsLinking] = useState(false)
  const [hostedLinkPollTrigger, setHostedLinkPollTrigger] = useState(0)
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

  const startHostedLinkSession = async (
    mode: LinkMode,
    tokenData: PlaidLinkTokenData,
  ) => {
    if (!usePlaidHostedLink || !tokenData.hosted_link_url) {
      return false
    }

    setLinkToken(null)
    saveHostedLinkSession({
      mode,
      businessId,
      linkToken: tokenData.link_token,
      startedAtMs: Date.now(),
    })

    if (openExternalAuth) {
      try {
        const handledByHostApp = await openExternalAuth({
          provider: 'PLAID',
          url: tokenData.hosted_link_url,
        })

        if (handledByHostApp) {
          return true
        }
      }
      catch (error) {
        const externalAuthError = error as {
          name?: string
          message?: string
        }
        console.warn('Failed to open Plaid hosted link via host callback', {
          name: externalAuthError.name,
          message: externalAuthError.message,
        })
      }
    }
    window.location.assign(tokenData.hosted_link_url)
    return true
  }

  useEffect(() => {
    if (!usePlaidHostedLink || typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    const triggerHostedLinkPoll = () => {
      setHostedLinkPollTrigger(current => current + 1)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerHostedLinkPoll()
      }
    }

    window.addEventListener('focus', triggerHostedLinkPoll)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', triggerHostedLinkPoll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [usePlaidHostedLink])

  /**
   * Initiates an add connection flow with Plaid
   */
  const fetchPlaidLinkToken = async () => {
    if (auth?.access_token) {
      const hostedLinkBody = buildHostedLinkRequestBody(usePlaidHostedLink)
      const tokenData = (
        await getPlaidLinkToken(apiUrl, auth.access_token, {
          params: { businessId },
          ...(hostedLinkBody ? { body: hostedLinkBody } : {}),
        })
      ).data
      setLinkMode('add')
      if (await startHostedLinkSession('add', tokenData)) {
        return
      }
      setLinkToken(tokenData.link_token)
    }
  }

  /**
   * Initiates a connection repair flow with Plaid
   */
  const fetchPlaidUpdateModeLinkToken = async (plaidItemPlaidId: string) => {
    if (auth?.access_token) {
      const hostedLinkBody = buildHostedLinkRequestBody(usePlaidHostedLink)
      const tokenData = (
        await getPlaidUpdateModeLinkToken(apiUrl, auth.access_token, {
          params: { businessId },
          body: {
            plaid_item_id: plaidItemPlaidId,
            ...(hostedLinkBody ?? {}),
          },
        })
      ).data
      setLinkMode('update')
      if (await startHostedLinkSession('update', tokenData)) {
        return
      }
      setLinkToken(tokenData.link_token)
    }
  }

  /**
   * When the user has finished entering credentials, send the resulting
   * token to the backend where it will fetch and save the Plaid access token
   * and item id
   * */
  const exchangePlaidPublicToken = async (
    publicToken: string,
    metadata?: PlaidLinkOnSuccessMetadata,
  ) => {
    setIsLinking(true)
    preloadAccountConfirmation()

    try {
      await exchangePlaidPublicTokenApi(apiUrl, auth?.access_token, {
        params: { businessId },
        body: { public_token: publicToken, institution: metadata?.institution ?? null },
      })
      await refetchAccounts()
      touch(DataModel.LINKED_ACCOUNTS)
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
        void updateConnectionStatus().then(() => {
          void refetchAccounts()
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

  const refetchAccounts = async () => {
    await mutate()
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

  useEffect(() => {
    if (!usePlaidHostedLink) {
      return
    }

    if (!auth?.access_token) {
      return
    }

    const hostedLinkSession = readHostedLinkSession()
    if (!hostedLinkSession || hostedLinkSession.businessId !== businessId) {
      return
    }

    const pollLockId = acquireHostedLinkPollLock()
    if (!pollLockId) {
      return
    }

    let isCancelled = false

    const pollHostedLinkSession = async () => {
      let shouldClearHostedLinkSession = false

      try {
        const expirationAtMs = hostedLinkSession.startedAtMs + HOSTED_LINK_POLL_TIMEOUT_MS

        while (!isCancelled && Date.now() <= expirationAtMs) {
          const tokenGetData = (
            await getPlaidLinkTokenState(apiUrl, auth.access_token, {
              params: { businessId },
              body: { link_token: hostedLinkSession.linkToken },
            })
          ).data
          if (isCancelled) {
            return
          }

          if (tokenGetData.status === 'pending') {
            await wait(HOSTED_LINK_POLL_INTERVAL_MS)
            continue
          }

          if (tokenGetData.status === 'exit') {
            shouldClearHostedLinkSession = true
            break
          }

          if (hostedLinkSession.mode === 'add') {
            if (!tokenGetData.public_token) {
              await wait(HOSTED_LINK_POLL_INTERVAL_MS)
              continue
            }

            await exchangePlaidPublicToken(tokenGetData.public_token)
            if (isCancelled) {
              return
            }
            shouldClearHostedLinkSession = true
          }
          else {
            await updateConnectionStatus()
            await refetchAccounts()
            touch(DataModel.LINKED_ACCOUNTS)
            if (isCancelled) {
              return
            }
            shouldClearHostedLinkSession = true
          }

          break
        }

        if (Date.now() > hostedLinkSession.startedAtMs + HOSTED_LINK_POLL_TIMEOUT_MS) {
          shouldClearHostedLinkSession = true
        }
      }
      catch (error) {
        const hostedLinkResumeError = error as {
          name?: string
          message?: string
          code?: number
          messages?: unknown
        }
        console.warn('Failed to resume Plaid hosted link session', {
          name: hostedLinkResumeError?.name,
          message: hostedLinkResumeError?.message,
          code: hostedLinkResumeError?.code,
          messages: hostedLinkResumeError?.messages,
        })
      }
      finally {
        if (!isCancelled) {
          if (shouldClearHostedLinkSession) {
            clearHostedLinkSession()
            setLinkMode('add')
          }
        }
        releaseHostedLinkPollLock(pollLockId)
      }
    }

    void pollHostedLinkSession()

    return () => {
      isCancelled = true
      releaseHostedLinkPollLock(pollLockId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.access_token, businessId, apiUrl, usePlaidHostedLink, hostedLinkPollTrigger])

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
