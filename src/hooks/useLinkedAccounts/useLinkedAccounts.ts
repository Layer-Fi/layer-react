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
}

const DEBUG = true
const USE_MOCK_RESPONSE_DATA = false

// Note: you will need to be using a business whose client's plaid client and plaid secret correspond to the
// plaid sandbox account
const USE_PLAID_SANDBOX = true

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState<LoadedStatus>('initial')

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

  const repairConnection = (source: Source, sourceId: string) => {
    if (source === 'PLAID') {
      fetchPlaidUpdateModeLinkToken(sourceId)
    } else {
      console.error(
        `Repairing a connection with source ${source} not yet supported`,
      )
    }
  }

  const removeConnection = (source: Source, connectionId: string) => {
    if (source === 'PLAID') {
      unlinkPlaidItem(connectionId)
    } else {
      console.error(
        `Removing a connection with source ${source} not yet supported`,
      )
    }
  }

  const unlinkAccount = (source: Source, accountId: string) => {
    DEBUG && console.log('unlinking account')
    if (source === 'PLAID') {
      Layer.unlinkAccount(apiUrl, auth?.access_token, {
        params: { businessId, accountId: accountId },
      })
    } else {
      console.error(
        `Unlinking an account with source ${source} not yet supported`,
      )
    }
  }

  const refetchAccounts = () => {
    DEBUG && console.log('refetching accounts...')
    mutate()
  }

  const unlinkPlaidItem = (plaidItemId: string) => {
    DEBUG && console.log('unlinking plaid item')
    Layer.unlinkPlaidItem(apiUrl, auth?.access_token, {
      params: { businessId, plaidItemId },
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
  }
}
