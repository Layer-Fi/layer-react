import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import type { Awaitable } from '@internal-types/utility/promises'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { confirmExternalAccount } from '@hooks/api/businesses/[business-id]/external-accounts/[external-account-id]/confirm'
import { excludeExternalAccount } from '@hooks/api/businesses/[business-id]/external-accounts/[external-account-id]/exclude'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type AccountConfirmExcludeFormState = Record<string, boolean>

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
      tags: ['#bulk-confirm', '#bulk-exclude'],
    }
  }
}

export function useConfirmAndExcludeMultiple({ onSuccess }: { onSuccess?: () => Awaitable<unknown> }) {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg }: { arg: AccountConfirmExcludeFormState },
    ) =>
      Promise.all(
        Object.entries(arg).map(([accountId, isConfirmed]) =>
          isConfirmed
            ? confirmExternalAccount(apiUrl, accessToken, {
              params: { businessId, accountId },
              body: { is_relevant: true },
            })
            : excludeExternalAccount(apiUrl, accessToken, {
              params: { businessId, accountId },
              body: { is_irrelevant: true },
            }),
        ),
      )
        .then(() => onSuccess?.())
        .then(() => true as const),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    (...triggerParameters: Parameters<typeof originalTrigger>) =>
      originalTrigger(...triggerParameters),
    [originalTrigger],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
