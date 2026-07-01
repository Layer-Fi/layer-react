import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const UPDATE_CONNECTION_STATUS_TAG_KEY = '#update-connection-status'

const updateConnectionStatus = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string }
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/external-accounts/update-connection-status`,
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
      tags: [UPDATE_CONNECTION_STATUS_TAG_KEY],
    } as const
  }
}

export function useUpdateConnectionStatus() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    ({ accessToken, apiUrl, businessId }) =>
      updateConnectionStatus(apiUrl, accessToken, {
        params: { businessId },
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
