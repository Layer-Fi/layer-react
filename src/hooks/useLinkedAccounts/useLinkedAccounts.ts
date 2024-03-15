// import { Layer } from '../../api/layer'
import { Metadata } from '../../types'
import { LinkedAccount } from '../../types/linked_accounts'
import { useLayerContext } from '../useLayerContext'

// import useSWR from 'swr'

const MOCK_DATA: LinkedAccount[] = [
  {
    name: 'Business Checking',
    account: '1234',
    amount: 1220620,
  },
  {
    name: 'Business Savings',
    account: '5678',
    amount: 1000206.2,
  },
  {
    name: 'Account',
    account: '4321',
    amount: 4400020620,
  },
]

type UseLinkedAccounts = () => {
  data?: LinkedAccount[]
  metadata: Metadata
  isLoading: boolean
  isValidating: boolean
  error: unknown
}

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  // const {
  //   data: responseData,
  //   isLoading,
  //   isValidating,
  //   error: responseError,
  //   mutate,
  // } = useSWR(
  //   businessId && auth?.access_token && `linked-accounts-${businessId}`,
  //   Layer.getLinkedAccounts(apiUrl, auth?.access_token, {
  //     params: { businessId },
  //   }),
  // )

  const responseData = { data: MOCK_DATA, meta: {}, error: undefined }
  const isLoading = false
  const isValidating = false

  const {
    data = undefined,
    meta: metadata = {},
    error = undefined,
  } = responseData || {}

  return {
    data,
    metadata,
    isLoading,
    isValidating,
    error,
  }
}
