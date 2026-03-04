import useSWRMutation from 'swr/mutation'

import { del } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { BANK_ACCOUNTS_TAG_KEY } from '@hooks/useLinkedAccounts/useListBankAccounts'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const unlinkBankAccount = del<
  Record<string, unknown>,
  Record<string, unknown>,
  {
    businessId: string
    bankAccountId: string
  }
>(
  ({ businessId, bankAccountId }) =>
    `/v1/businesses/${businessId}/bank-accounts/${bankAccountId}`,
)

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

export function useUnlinkBankAccount() {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  return useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }, { arg: bankAccountId }: { arg: string }) =>
      unlinkBankAccount(apiUrl, accessToken, {
        params: { businessId, bankAccountId },
      }),
    {
      revalidate: false,
    },
  )
}
