import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import type { OneOf } from '@internal-types/utility/oneOf'
import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const CONFIRM_EXTERNAL_ACCOUNT_TAG_KEY = '#confirm-external-account'

export type ConfirmAccountBodyStrict = OneOf<[
  { is_unique: true },
  { is_relevant: true },
]>

export const confirmExternalAccount = post<
  Record<string, unknown>,
  ConfirmAccountBodyStrict,
  { businessId: string, accountId: string }
>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/external-accounts/${accountId}/confirm`,
)

type ConfirmExternalAccountArg = {
  accountId: string
  body?: ConfirmAccountBodyStrict
}

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
      tags: [CONFIRM_EXTERNAL_ACCOUNT_TAG_KEY],
    } as const
  }
}

export function useConfirmExternalAccount() {
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
      { arg: { accountId, body } }: { arg: ConfirmExternalAccountArg },
    ) => confirmExternalAccount(apiUrl, accessToken, {
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
