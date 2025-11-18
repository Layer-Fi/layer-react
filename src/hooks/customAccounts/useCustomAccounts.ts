import useSWR from 'swr'

import { get } from '@api/layer/authenticated_http'
import { mapRawCustomAccountToCustomAccount, type RawCustomAccount } from '@hooks/customAccounts/types'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const CUSTOM_ACCOUNTS_TAG_KEY = '#custom-accounts'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  userCreated,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  userCreated?: boolean
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      userCreated,
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
    userCreated?: boolean
  }
>(({ businessId, userCreated }) => {
  const baseUrl = `/v1/businesses/${businessId}/custom-accounts`

  if (userCreated !== undefined) {
    return `${baseUrl}?user_created=${userCreated}`
  }
  return baseUrl
})

type useCustomAccountsParams = {
  userCreated?: boolean
}
export function useCustomAccounts({ userCreated }: useCustomAccountsParams = {}) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...data,
      businessId,
      userCreated,
    }),
    ({ accessToken, apiUrl, businessId, userCreated }) => getCustomAccounts(
      apiUrl,
      accessToken,
      {
        params: { businessId, userCreated },
      },
    )().then(({ data }) => data?.custom_accounts.map(account => mapRawCustomAccountToCustomAccount(account))),
  )
}
