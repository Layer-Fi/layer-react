import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import type { OneOf } from '@internal-types/utility/oneOf'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const EXCLUDE_EXTERNAL_ACCOUNT_TAG_KEY = '#exclude-external-account'

export type ExcludeAccountBodyStrict = OneOf<[
  { is_irrelevant: true },
  { is_duplicate: true },
]>

export const excludeExternalAccount = post<
  Record<string, unknown>,
  ExcludeAccountBodyStrict,
  { businessId: string, accountId: string }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/external-accounts/${accountId}/exclude`,
)

type ExcludeExternalAccountArg = {
  accountId: string
  body?: ExcludeAccountBodyStrict
}

const buildKey = createBuildKey<{ businessId: string }>([EXCLUDE_EXTERNAL_ACCOUNT_TAG_KEY])

export function useExcludeExternalAccount() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { accountId, body } }: { arg: ExcludeExternalAccountArg },
    ) => excludeExternalAccount(apiUrl, accessToken, {
      params: { businessId, accountId },
      body,
    }),
    {
      revalidate: false,
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
