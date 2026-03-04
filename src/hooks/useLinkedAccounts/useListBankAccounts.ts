import useSWR from 'swr'

import { listBankAccounts } from '@api/layer/linked_accounts'
import { BANK_ACCOUNTS_TAG_KEY } from '@hooks/bookkeeping/useBankAccounts'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [BANK_ACCOUNTS_TAG_KEY],
    } as const
  }
}

export function useListBankAccounts() {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  return useSWR(
    () =>
      buildKey({
        ...auth,
        apiUrl,
        businessId,
      }),
    ({ accessToken, apiUrl, businessId }) => listBankAccounts(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(({ data }) => data),
  )
}
