import { del } from '@api/layer/authenticated_http'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useAuth } from '@hooks/useAuth'
import useSWRMutation from 'swr/mutation'
import { useCallback } from 'react'

const REJECT_CATEGORIZATION_RULE_SUGGESTION_TAG = '#reject-categorization-rule-suggestion'

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
      tags: [REJECT_CATEGORIZATION_RULE_SUGGESTION_TAG],
    }
  }
}

export const rejectCategorizationRulesUpdateSuggestion = del<never>(
  ({ businessId, suggestionId }) =>
    `/v1/businesses/${businessId}/categorization-rules/suggestions/${suggestionId}`,
)

export function useRejectCategorizationRulesUpdateSuggestion() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    }),
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
