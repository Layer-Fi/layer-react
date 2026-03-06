import useSWR from 'swr'

import type { LinkedAccounts } from '@internal-types/linkedAccounts'
import { get } from '@utils/api/authenticatedHttp'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const listExternalAccounts = get<
  { data: LinkedAccounts },
  {
    businessId: string
  }
>(({ businessId }) => `/v1/businesses/${businessId}/external-accounts`)

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
