// import { Layer } from '../../api/layer'
import { useEffect, useState } from 'react'
import { Metadata } from '../../types'
import { LinkedAccount } from '../../types/linked_accounts'
import { useLayerContext } from '../useLayerContext'

// import useSWR from 'swr'

const MOCK_DATA: LinkedAccount[] = [
  {
    name: 'Public Demo Banking',
    account: '1234',
    amount: 1220620,
  },
  /* Temporarily removing these to make it match test data (with one account)
   * we're using in the demo.
   */
  // {
  //   name: 'Business Savings',
  //   account: '5678',
  //   amount: 1000206.2,
  // },
  // {
  //   name: 'Account',
  //   account: '4321',
  //   amount: 801.91,
  // },
]

type UseLinkedAccounts = () => {
  data?: LinkedAccount[]
  metadata: Metadata
  isLoading: boolean
  isValidating: boolean
  error: unknown
  refetch: () => void
}

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }, [])

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
  const isValidating = false

  const {
    data = undefined,
    meta: metadata = {},
    error = undefined,
  } = responseData || {}

  const refetch = () => {
    console.log('refetch...')
  }

  return {
    data,
    metadata,
    isLoading,
    isValidating,
    error,
    refetch,
  }
}
