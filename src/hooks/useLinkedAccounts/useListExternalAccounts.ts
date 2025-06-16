import useSWR from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { listExternalAccounts } from '../../api/layer/linked_accounts'
import { APIError } from '../../models/APIError'
import { LinkedAccounts } from '../../types/linked_accounts'

export const EXTERNAL_ACCOUNTS_TAG_KEY = '#external-accounts'

type KeyType = {
  accessToken: string
  apiUrl: string
  businessId: string
  tags: readonly [typeof EXTERNAL_ACCOUNTS_TAG_KEY]
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
      tags: [EXTERNAL_ACCOUNTS_TAG_KEY],
    } as const
  }
}

export function useListExternalAccounts() {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  return useSWR<LinkedAccounts['external_accounts'], APIError>(
    () =>
      buildKey({
        ...auth,
        apiUrl,
        businessId,
      }),
    ({ accessToken, apiUrl, businessId }: KeyType) => listExternalAccounts(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(({ data }) => data.external_accounts),
  )
}
