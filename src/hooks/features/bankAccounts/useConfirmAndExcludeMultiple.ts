import useSWRMutation from 'swr/mutation'

import { SWRMutationResult } from '@internal-types/swr/SWRResponseTypes'
import type { Awaitable } from '@internal-types/utility/promises'
import { createBuildKey } from '@utils/swr/createBuildKey'
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

  return new SWRMutationResult(rawMutationResponse)
}
