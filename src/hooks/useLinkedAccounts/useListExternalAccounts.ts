import useSWR from 'swr'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { listExternalAccounts } from '@api/layer/linked_accounts'

export const EXTERNAL_ACCOUNTS_TAG_KEY = '#external-accounts'

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
      tags: [EXTERNAL_ACCOUNTS_TAG_KEY],
    } as const
  }
}

export function useListExternalAccounts() {
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
    ({ accessToken, apiUrl, businessId }) => listExternalAccounts(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(({ data }) => data.external_accounts),
  )
}
