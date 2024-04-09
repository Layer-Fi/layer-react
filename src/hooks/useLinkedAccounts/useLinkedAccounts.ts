// import { Layer } from '../../api/layer'
import { useEffect, useState } from 'react'
import { Metadata } from '../../types'
import { LinkedAccount } from '../../types/linked_accounts'
import { useLayerContext } from '../useLayerContext'

// import useSWR from 'swr'

const MOCK_DATA: LinkedAccount[] = [
  {
    id: '1',
    accountName: 'Business Checking',
    accountNumber: '1234',
    latestBalance: 1220620,
    ledgerBalance: 1220620,
    institution: 'Chase',
    institutionLogo: '',
  },
  {
    id: '2',
    accountName: 'Business Savings',
    accountNumber: '5678',
    latestBalance: 1000206.2,
    ledgerBalance: 1220620,
    institution: 'Chase',
    institutionLogo: '',
  },
  {
    id: '3',
    accountName: 'Account',
    accountNumber: '4321',
    latestBalance: 4400020620,
    ledgerBalance: 1220620,
    institution: 'Chase',
    institutionLogo: '',
  },
  {
    id: '4',
    accountName: 'Business Checking',
    accountNumber: '1234',
    latestBalance: 1220620,
    ledgerBalance: 1220620,
    institution: 'Chase',
    institutionLogo: '',
  },
  {
    id: '5',
    accountName: 'Business Savings',
    accountNumber: '5678',
    latestBalance: 1000206.2,
    ledgerBalance: 1220620,
    institution: 'Chase',
    institutionLogo: '',
  },
  {
    id: '6',
    accountName: 'Business Savings',
    accountNumber: '5678',
    latestBalance: 1000206.2,
    ledgerBalance: 1220620,
    institution: 'Chase',
    institutionLogo: '',
  },
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
