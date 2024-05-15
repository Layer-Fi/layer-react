import { useEffect, useState } from 'react'
import { PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link'
import { Layer } from '../../api/layer'
import { LoadedStatus } from '../../types/general'
import { LinkedAccount, Source } from '../../types/linked_accounts'
import { useLayerContext } from '../useLayerContext'
import { LINKED_ACCOUNTS_MOCK_DATA } from './mockData'
import useSWR from 'swr'

type UseLinkedAccounts = () => {
  data?: LinkedAccount[]
  isLoading: boolean
  loadingStatus: LoadedStatus
  isValidating: boolean
  error: unknown
  addConnection: (source: Source) => void
  removeConnection: (source: Source, sourceId: string) => void // means, "unlink institution"
  repairConnection: (source: Source, sourceId: string) => void
  refetchAccounts: () => void
  unlinkAccount: (source: Source, accountId: string) => void
  confirmAccount: (source: Source, accountId: string) => void
  denyAccount: (source: Source, accountId: string) => void

  // Only works in non-production environments for test purposes
  breakConnection: (source: Source, connectionExternalId: string) => void
}

const DEBUG = true
const USE_MOCK_RESPONSE_DATA = false


export const useLinkedAccounts: UseLinkedAccounts = () => {
  const { auth, businessId, apiUrl, usePlaidSandbox } = useLayerContext()
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')
  const USE_PLAID_SANDBOX = usePlaidSandbox ?? true

  const {
    data: responseData,
    isLoading,
    isValidating,
    error: responseError,
    mutate,
  } = useSWR(
    businessId && auth?.access_token && `linked-accounts-${businessId}`,
    Layer.getLinkedAccounts(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

  useEffect(() => {
    if (!isLoading && responseData?.data.external_accounts) {
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
      setLinkToken(linkToken)
    }
  }

  /**
   * Initiates a connection repair flow with Plaid
   */
  const fetchPlaidUpdateModeLinkToken = async (plaidItemId: string) => {
    if (auth?.access_token) {
      const linkToken = (
        await Layer.getPlaidUpdateModeLinkToken(apiUrl, auth.access_token, {
          params: { businessId },
          body: { plaid_item_id: plaidItemId },
        })
      ).data.link_token
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
    await Layer.exchangePlaidPublicToken(apiUrl, auth?.access_token, {
      params: { businessId },
      body: { public_token: publicToken, institution: metadata.institution },
    })

    refetchAccounts()
  }

  const { open: plaidLinkStart, ready: plaidLinkReady } = usePlaidLink({
    token: linkToken,
    onSuccess: exchangePlaidPublicToken,
    env: USE_PLAID_SANDBOX ? 'sandbox' : undefined,
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

  const addConnection = (source: Source) => {
    if (source === 'PLAID') {
      fetchPlaidLinkToken()
    } else {
      console.error(
        `Adding a connection with source ${source} not yet supported`,
      )
    }
  }

  const repairConnection = async (
    source: Source,
    connectionExternalId: string,
  ) => {
    if (source === 'PLAID') {
      await fetchPlaidUpdateModeLinkToken(connectionExternalId)
    } else {
      console.error(
        `Repairing a connection with source ${source} not yet supported`,
      )
    }
  }

  const removeConnection = async (
    source: Source,
    connectionExternalId: string,
  ) => {
    if (source === 'PLAID') {
      await unlinkPlaidItem(connectionExternalId)
    } else {
      console.error(
        `Removing a connection with source ${source} not yet supported`,
      )
    }
  }

  const unlinkAccount = async (source: Source, accountId: string) => {
    DEBUG && console.log('unlinking account')
    if (source === 'PLAID') {
      await Layer.unlinkAccount(apiUrl, auth?.access_token, {
        params: { businessId, accountId: accountId },
      })
    } else {
      console.error(
        `Unlinking an account with source ${source} not yet supported`,
      )
    }
  }

  /**
   * Note: When the user confirms an account is not a duplicate, this confirmation
   * actually applies to the institution connection as a whole.
   */
  const confirmAccount = async (source: Source, accountId: string) => {
    DEBUG && console.log('confirming account')
    if (source === 'PLAID') {
      await Layer.confirmConnection(apiUrl, auth?.access_token, {
        params: {
          businessId,
          accountId,
        },
      })
    } else {
      console.error(
        `Confirming an account with source ${source} not yet supported`,
      )
    }
  }

  /**
   * Note: When the user identifies an account as a duplicate, this
   * actually applies to the institution connection as a whole. It means that
   * there is a duplicate institution connection
   */
  const denyAccount = async (source: Source, accountId: string) => {
    DEBUG && console.log('confirming account')
    if (source === 'PLAID') {
      await Layer.denyConnection(apiUrl, auth?.access_token, {
        params: {
          businessId,
          accountId,
        },
      })
    } else {
      console.error(
        `Denying an account with source ${source} not yet supported`,
      )
    }
  }

  /**
   * Test utility that puts a connection into a broken state. Only works in non-production environments.
   */
  const breakConnection = (source: Source, connectionExternalId: string) => {
    DEBUG && console.log('Breaking sandbox plaid item connection')
    if (source === 'PLAID') {
      Layer.breakPlaidItemConnection(apiUrl, auth?.access_token, {
        params: {
          businessId,
          plaidItemPlaidId: connectionExternalId,
        },
      })
    } else {
      console.error(
        `Breaking a sandbox connection with source ${source} not yet supported`,
      )
    }
  }

  const refetchAccounts = () => {
    DEBUG && console.log('refetching accounts...')
    mutate()
  }

  const unlinkPlaidItem = async (plaidItemPlaidId: string) => {
    DEBUG && console.log('unlinking plaid item')
    await Layer.unlinkPlaidItem(apiUrl, auth?.access_token, {
      params: { businessId, plaidItemPlaidId },
    })
  }

  return {
    data: USE_MOCK_RESPONSE_DATA
      ? mockResponseData.data
      : responseData?.data.external_accounts,
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
    denyAccount,
    breakConnection,
  }
}
