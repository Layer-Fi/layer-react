import { useEffect, useState } from 'react'
import { PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { DataModel, LoadedStatus } from '../../types/general'
import { LinkedAccount, AccountSource } from '../../types/linked_accounts'
import { LINKED_ACCOUNTS_MOCK_DATA } from './mockData'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import type { Awaitable } from '../../types/utility/promises'
import { useAccountConfirmationStoreActions } from '../../providers/AccountConfirmationStoreProvider'
import { useListExternalAccounts } from './useListExternalAccounts'

export function getAccountsNeedingConfirmation(linkedAccounts: ReadonlyArray<LinkedAccount>) {
  return linkedAccounts.filter(
    ({ notifications }) => notifications?.some(({ type }) => type === 'CONFIRM_RELEVANT'),
  )
}

type UseLinkedAccounts = () => {
  data?: LinkedAccount[]
  isLoading: boolean
  loadingStatus: LoadedStatus
  isValidating: boolean
  error: unknown
  addConnection: (source: AccountSource) => void
  removeConnection: (source: AccountSource, sourceId: string) => void // means, "unlink institution"
  repairConnection: (source: AccountSource, reconnectWithNewCredentials: boolean, sourceId: string) => void
  updateConnectionStatus: () => void
  refetchAccounts: () => Awaitable<void>
  syncAccounts: () => void
  unlinkAccount: (source: AccountSource, userCreated: boolean, accountId: string) => void
  confirmAccount: (source: AccountSource, accountId: string) => void
  excludeAccount: (source: AccountSource, accountId: string) => void
  accountsToAddOpeningBalanceInModal: LinkedAccount[]
  setAccountsToAddOpeningBalanceInModal: (accounts: LinkedAccount[]) => void

  // Only works in non-production environments for test purposes
  breakConnection: (source: AccountSource, connectionExternalId: string) => void
}

const DEBUG = false
const USE_MOCK_RESPONSE_DATA = false

type LinkMode = 'update' | 'add'

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const {
    businessId,
    touch,
    read,
    syncTimestamps,
    hasBeenTouched,
  } = useLayerContext()

  const { apiUrl, usePlaidSandbox } = useEnvironment()
  const { data: auth } = useAuth()
  const {
    preload: preloadAccountConfirmation,
    reset: resetAccountConfirmation,
  } = useAccountConfirmationStoreActions()

  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')
  const [linkMode, setLinkMode] = useState<LinkMode>('add')
  const [accountsToAddOpeningBalanceInModal, setAccountsToAddOpeningBalanceInModal] =
    useState<LinkedAccount[]>([])

  const queryKey = businessId && auth?.access_token && `linked-accounts-${businessId}`

  const {
    data: externalAccounts,
    isLoading,
    isValidating,
    error: responseError,
    mutate,
  } = useListExternalAccounts()

  useEffect(() => {
    if (!isLoading && externalAccounts) {
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
  }, [isLoading])

  /**
   * Initiates an add connection flow with Plaid
   */
  const fetchPlaidLinkToken = async () => {
    if (auth?.access_token) {
      const linkToken = (
        await Layer.getPlaidLinkToken(apiUrl, auth.access_token, {
          params: { businessId },
        })
      ).data.link_token
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
        await Layer.getPlaidUpdateModeLinkToken(apiUrl, auth.access_token, {
          params: { businessId },
          body: { plaid_item_id: plaidItemPlaidId },
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
  const exchangePlaidPublicToken = async (
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata,
  ) => {
    preloadAccountConfirmation()

    try {
      await Layer.exchangePlaidPublicToken(apiUrl, auth?.access_token, {
        params: { businessId },
        body: { public_token: publicToken, institution: metadata.institution },
      })
      await refetchAccounts()
    }
    finally {
      resetAccountConfirmation()
    }
  }

  const { open: plaidLinkStart, ready: plaidLinkReady } = usePlaidLink({
    token: linkToken,

    // If in update mode, we don't need to exchange the public token for an access token.
    // The existing access token will automatically become valid again
    onSuccess: async (
      publicToken: string,
      metadata: PlaidLinkOnSuccessMetadata,
    ) => {
      if (linkMode == 'add') {
        // Note: a sync is kicked off in the backend in this endpoint
        exchangePlaidPublicToken(publicToken, metadata)
      }
      else {
        // Refresh the account connections, which should remove the error
        // pills from any broken accounts
        await updateConnectionStatus()
        refetchAccounts()
        setLinkMode('add')
        touch(DataModel.LINKED_ACCOUNTS)
      }
    },
    onExit: () => setLinkMode('add'),
    env: usePlaidSandbox ? 'sandbox' : undefined,
  })

  useEffect(() => {
    if (plaidLinkReady) {
      plaidLinkStart()
    }
  }, [plaidLinkStart, plaidLinkReady])

  const mockResponseData = {
    data: LINKED_ACCOUNTS_MOCK_DATA,
    meta: {},
    error: undefined,
  }

  const addConnection = (source: AccountSource) => {
    if (source === 'PLAID') {
      fetchPlaidLinkToken()
    }
    else {
      console.error(
        `Adding a connection with source ${source} not yet supported`,
      )
    }
  }

  const repairConnection = async (
    source: AccountSource,
    reconnectWithNewCredentials: boolean,
    connectionExternalId: string,
  ) => {
    if (source === 'PLAID') {
      await (reconnectWithNewCredentials ? fetchPlaidLinkToken() : fetchPlaidUpdateModeLinkToken(connectionExternalId))
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

  const unlinkAccount = async (source: AccountSource, userCreated: boolean, accountId: string) => {
    DEBUG && console.debug('unlinking account')
    if (source === 'PLAID' || (source === 'CUSTOM' && userCreated)) {
      await Layer.unlinkAccount(apiUrl, auth?.access_token, {
        params: { businessId, accountId },
      })
      await refetchAccounts()
      touch(DataModel.LINKED_ACCOUNTS)
    }
    else if (source === 'CUSTOM') {
      console.error(
        'Deleting a custom account that is not user-created is not yet supported',
      )
    }
    else {
      console.error(
        `Unlinking an account with source ${source} not yet supported`,
      )
    }
  }

  const confirmAccount = async (source: AccountSource, accountId: string) => {
    DEBUG && console.debug('confirming account')
    if (source === 'PLAID') {
      await Layer.confirmAccount(apiUrl, auth?.access_token, {
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
    DEBUG && console.debug('excluding account')
    if (source === 'PLAID') {
      await Layer.excludeAccount(apiUrl, auth?.access_token, {
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
    DEBUG && console.debug('Breaking sandbox plaid item connection')
    if (source === 'PLAID') {
      await Layer.breakPlaidItemConnection(apiUrl, auth?.access_token, {
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
    DEBUG && console.debug('refetching accounts...')
    await mutate()
  }

  const syncAccounts = async () => {
    DEBUG && console.debug('resyncing accounts...')
    await Layer.syncConnection(apiUrl, auth?.access_token, {
      params: { businessId },
    })
  }

  const updateConnectionStatus = async () => {
    DEBUG && console.debug('updating connection status...')
    await Layer.updateConnectionStatus(apiUrl, auth?.access_token, {
      params: { businessId },
    })
  }

  const unlinkPlaidItem = async (plaidItemPlaidId: string) => {
    DEBUG && console.debug('unlinking plaid item')
    await Layer.unlinkPlaidItem(apiUrl, auth?.access_token, {
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
  }, [isLoading, isValidating])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      refetchAccounts()
    }
  }, [syncTimestamps])

  return {
    data: USE_MOCK_RESPONSE_DATA
      ? mockResponseData.data
      : (externalAccounts ?? []),
    isLoading,
    loadingStatus,
    isValidating,
    error: responseError,
    addConnection,
    removeConnection,
    repairConnection,
    refetchAccounts,
    unlinkAccount,
    confirmAccount,
    excludeAccount,
    breakConnection,
    syncAccounts,
    updateConnectionStatus,
    accountsToAddOpeningBalanceInModal,
    setAccountsToAddOpeningBalanceInModal,
  }
}
