import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { get } from '../../api/layer/authenticated_http'
import useSWR from 'swr'
import { CustomAccount, mapRawCustomAccountToCustomAccount, type RawCustomAccount } from './types'
import { APIError } from '../../models/APIError'

export const CUSTOM_ACCOUNTS_TAG_KEY = '#custom-accounts'

type KeyType = {
  accessToken: string
  apiUrl: string
  businessId: string
  tags: readonly [typeof CUSTOM_ACCOUNTS_TAG_KEY]
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}): KeyType | undefined {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [CUSTOM_ACCOUNTS_TAG_KEY],
    } as const
  }
}

const getCustomAccounts = get<
  {
    data: {
      type: 'Custom_Accounts'
      custom_accounts: RawCustomAccount[]
    }
  },
  {
    businessId: string
  }
>(({ businessId }) => `/v1/businesses/${businessId}/custom-accounts/`)

export function useCustomAccounts() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR<CustomAccount[], APIError>(
    () => buildKey({
      ...data,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }: KeyType) => getCustomAccounts(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(({ data }) => data?.custom_accounts.map(account => mapRawCustomAccountToCustomAccount(account))),
  )
}
