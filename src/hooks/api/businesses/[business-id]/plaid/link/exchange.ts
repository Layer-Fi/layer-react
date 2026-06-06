import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import type { PublicToken } from '@internal-types/linkedAccounts'
import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const EXCHANGE_PLAID_PUBLIC_TOKEN_TAG_KEY = '#exchange-plaid-public-token'

const exchangePlaidPublicToken = post<
  Record<string, unknown>,
  PublicToken,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/plaid/link/exchange`)

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
      tags: [EXCHANGE_PLAID_PUBLIC_TOKEN_TAG_KEY],
    } as const
  }
}

export function useExchangePlaidPublicToken() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: PublicToken },
    ) => exchangePlaidPublicToken(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    ),
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
