import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { SWRMutationResult } from '@internal-types/swr/SWRResponseTypes'
import type { Awaitable } from '@internal-types/utility/promises'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { confirmExternalAccount } from '@hooks/api/businesses/[business-id]/external-accounts/[external-account-id]/confirm'
import { excludeExternalAccount } from '@hooks/api/businesses/[business-id]/external-accounts/[external-account-id]/exclude'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export type AccountConfirmExcludeFormState = Record<string, boolean>

const buildKey = createBuildKey<{ businessId: string }>(['#bulk-confirm', '#bulk-exclude'])

export function useConfirmAndExcludeMultiple({ onSuccess }: { onSuccess?: () => Awaitable<unknown> }) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

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
