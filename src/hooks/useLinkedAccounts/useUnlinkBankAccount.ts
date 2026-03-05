import { useCallback, useRef } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/authenticatedHttp'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const UNLINK_BANK_ACCOUNT_TAG_KEY = '#unlink-bank-account'

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
      tags: [UNLINK_BANK_ACCOUNT_TAG_KEY],
    } as const
  }
}

export function useUnlinkBankAccount() {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const { trigger: rawTrigger, ...rest } = useSWRMutation(
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

  const triggerRef = useRef(rawTrigger)
  triggerRef.current = rawTrigger

  const trigger = useCallback(
    (bankAccountId: string) => triggerRef.current(bankAccountId),
    [],
  )

  return { trigger, ...rest }
}
