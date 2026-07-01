import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const BREAK_PLAID_ITEM_CONNECTION_TAG_KEY = '#break-plaid-item-connection'

/**
 * Test utility that puts a Plaid connection into a broken state; only works in
 * non-production environments.
 */
const breakPlaidItemConnection = post<
  Record<string, unknown>,
  Record<string, unknown>,
  { businessId: string, plaidItemId: string }
>(
  ({ businessId, plaidItemId }) =>
    `/v1/businesses/${businessId}/plaid/items/${plaidItemId}/sandbox-reset-item-login`,
)

const buildKey = createBuildKey<{ businessId: string }>([BREAK_PLAID_ITEM_CONNECTION_TAG_KEY])

export function useBreakPlaidItemConnection() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { plaidItemId } }: { arg: { plaidItemId: string } },
    ) => breakPlaidItemConnection(apiUrl, accessToken, {
      params: { businessId, plaidItemId },
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
