import { useEffect, useState } from 'react'
import { PlaidLinkOnSuccessMetadata, usePlaidLink } from 'react-plaid-link'
import { Layer } from '../../api/layer'
import { LinkedAccount } from '../../types/linked_accounts'
import { useLayerContext } from '../useLayerContext'
import { LINKED_ACCOUNTS_MOCK_DATA } from './mockData'
import useSWR from 'swr'

type Source = 'PLAID' | 'STRIPE'

type UseLinkedAccounts = () => {
  data?: LinkedAccount[]
  isLoading: boolean
  isValidating: boolean
  error: unknown
  addConnection: (source: Source) => void
  removeConnection: (source: Source, sourceId: string) => void // means, "unlink institution"
  refetchAccounts: () => void
  unlinkAccount: (plaidAccountId: string) => void
  renewLinkAccount: () => void
}

const DEBUG = true
const USE_MOCK_RESPONSE_DATA = false

// Note: you will need to be using a business whose client's plaid client and plaid secret correspond to the
// plaid sandbox account
const USE_PLAID_SANDBOX = true

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()
  const [linkToken, setLinkToken] = useState<string | null>(null)

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

  // Fetch link token on component load
  useEffect(() => {
    const getLinkToken = async () => {
      if (auth?.access_token) {
        const linkToken = (
          await Layer.getPlaidLinkToken(apiUrl, auth.access_token, {
            params: { businessId },
          })
        ).data.link_token
        setLinkToken(linkToken)
      }
    }
    getLinkToken()
  }, [setLinkToken, auth?.access_token])

  /**
   * When the user has finished entering credentials, send the resulting
   * token to the backend where it will fetch and save the Plaid access token
   * and item id
   * */
  const exchangePublicToken = async (
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata,
  ) => {
    await Layer.exchangePlaidPublicToken(apiUrl, auth?.access_token, {
      params: { businessId },
      body: { public_token: publicToken, institution_id: metadata.institution },
    })

    refetchAccounts()
  }

  const { open: plaidLinkStart, ready: plaidLinkReady } = usePlaidLink({
    token: linkToken,
    onSuccess: exchangePublicToken,
    env: USE_PLAID_SANDBOX ? 'sandbox' : undefined,
  })

  const mockResponseData = {
    data: LINKED_ACCOUNTS_MOCK_DATA,
    meta: {},
    error: undefined,
  }

  const addConnection = (source: Source) => {
    if (source === 'PLAID') {
      linkPlaidItem()
    } else {
      console.error(`Connection with source ${source} not yet supported`)
    }
  }

  const removeConnection = (source: Source, connectionId: string) => {
    if (source === 'PLAID') {
      unlinkPlaidItem(connectionId)
    } else {
      console.error(`Connection with source ${source} not yet supported`)
    }
  }

  const linkPlaidItem = async () => {
    DEBUG && console.log('add account...')
    // TODO: display error if not ready
    console.log('plaidLinkReady', plaidLinkReady)
    plaidLinkReady && plaidLinkStart()
  }

  const unlinkPlaidItem = (plaidItemId: string) => {
    DEBUG && console.log('unlinking plaid item')
    Layer.unlinkPlaidItem(apiUrl, auth?.access_token, {
      params: { businessId, plaidItemId },
    })
  }

  const unlinkAccount = (plaidAccountId: string) => {
    DEBUG && console.log('unlinking account')
    Layer.unlinkPlaidAccount(apiUrl, auth?.access_token, {
      params: { businessId, accountId: plaidAccountId },
    })
  }

  const renewLinkAccount = () => {
    DEBUG && console.log('relink account...')
  }

  const refetchAccounts = () => {
    DEBUG && console.log('refetching plaid accounts...')
    mutate()
  }

  return {
    data: USE_MOCK_RESPONSE_DATA
      ? mockResponseData.data
      : responseData?.data.external_accounts,
    isLoading,
    isValidating,
    error: responseError,
    addConnection,
    removeConnection,
    refetchAccounts,
    unlinkAccount,
    renewLinkAccount,
  }
}
