import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useAuth } from '@hooks/utils/auth/useAuth'
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
  const withLocale = useLocalizedKey()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl,
      businessId,
    })),
    ({ accessToken, apiUrl, businessId }, { arg: bankAccountId }: { arg: string }) =>
      unlinkBankAccount(apiUrl, accessToken, {
        params: { businessId, bankAccountId },
      }),
    {
      revalidate: false,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)
      void forceReloadBankTransactions()
      return triggerResult
    },
    [originalTrigger, forceReloadBankTransactions],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
