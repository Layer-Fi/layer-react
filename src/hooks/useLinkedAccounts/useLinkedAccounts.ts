import { Layer } from '../../api/layer'
import { LinkedAccount } from '../../types/linked_accounts'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

const MOCK_DATA: LinkedAccount[] = [
  {
    id: '1',
    external_account_name: 'Citi Double Cash® Card',
    external_account_number: '1234',
    latest_balance_timestamp: {
      external_account_external_id: '0Br385JmgbTryJn8nEBnUb4A5ydv06U9Vbqqq',
      external_account_source: 'PLAID',
      balance: 435121,
      at: '2024-04-03T13:00:00Z',
      created_at: '2024-04-06T16:44:35.715458Z',
    },
    current_ledger_balance: 373717,
    institution: 'Chase',
    institutionLogo: '',
  },
  {
    id: '2',
    external_account_name: 'Citi Double Cash® Card',
    external_account_number: '1234',
    latest_balance_timestamp: {
      external_account_external_id: '0Br385JmgbTryJn8nEBnUb4A5ydv06U9Vbqqq',
      external_account_source: 'PLAID',
      balance: 435121,
      at: '2024-04-03T13:00:00Z',
      created_at: '2024-04-06T16:44:35.715458Z',
    },
    current_ledger_balance: 373717,
    institution: 'Chase',
    institutionLogo: '',
  },
  {
    id: '3',
    external_account_name: 'Citi Double Cash® Card',
    external_account_number: '1234',
    latest_balance_timestamp: {
      external_account_external_id: '0Br385JmgbTryJn8nEBnUb4A5ydv06U9Vbqqq',
      external_account_source: 'PLAID',
      balance: 435121,
      at: '2024-04-03T13:00:00Z',
      created_at: '2024-04-06T16:44:35.715458Z',
    },
    current_ledger_balance: 373717,
    institution: 'Chase',
    institutionLogo: '',
  },
  {
    id: '4',
    external_account_name: 'Citi Double Cash® Card',
    external_account_number: '1234',
    latest_balance_timestamp: {
      external_account_external_id: '0Br385JmgbTryJn8nEBnUb4A5ydv06U9Vbqqq',
      external_account_source: 'PLAID',
      balance: 435121,
      at: '2024-04-03T13:00:00Z',
      created_at: '2024-04-06T16:44:35.715458Z',
    },
    current_ledger_balance: 373717,
    institution: 'Chase',
    institutionLogo: '',
  },
]

type UseLinkedAccounts = () => {
  data?: LinkedAccount[]
  isLoading: boolean
  isValidating: boolean
  error: unknown
  refetch: () => void
  addAccount: () => void
  unlinkAccount: () => void
  renewLinkAccount: () => void
}

export const useLinkedAccounts: UseLinkedAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const {
    // data: responseData,
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

  const responseData = { data: MOCK_DATA, meta: {}, error: undefined }
  // const isValidating = false

  const addAccount = () => {
    console.log('add account...')
  }

  const unlinkAccount = () => {
    console.log('unlink account...')
  }

  const renewLinkAccount = () => {
    console.log('relink account...')
  }

  const refetch = () => {
    console.log('refetch...')
  }

  return {
    // data: responseData?.data.external_accounts,
    data: responseData.data,
    isLoading,
    isValidating,
    error: responseError,
    refetch,
    addAccount,
    unlinkAccount,
    renewLinkAccount,
  }
}
