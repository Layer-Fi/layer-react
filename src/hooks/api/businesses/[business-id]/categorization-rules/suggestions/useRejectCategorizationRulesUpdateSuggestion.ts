import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { del } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const REJECT_CATEGORIZATION_RULE_SUGGESTION_TAG = '#reject-categorization-rule-suggestion'

const buildKey = createBuildKey<{ businessId: string }>([REJECT_CATEGORIZATION_RULE_SUGGESTION_TAG])

export const rejectCategorizationRulesUpdateSuggestion = del<never>(
  ({ businessId, suggestionId }) =>
    `/v1/businesses/${businessId}/categorization-rules/suggestions/${suggestionId}`,
)

export function useRejectCategorizationRulesUpdateSuggestion() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: suggestionId }: { arg: string },
    ) => rejectCategorizationRulesUpdateSuggestion(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          suggestionId,
        },
      },
    ),
    {
      revalidate: false,
    },
  )
  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)
      return triggerResultPromise
    }, [originalTrigger],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
