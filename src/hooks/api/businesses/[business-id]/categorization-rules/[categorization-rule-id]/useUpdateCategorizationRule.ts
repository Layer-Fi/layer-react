import { useCallback } from 'react'
import { Schema } from 'effect/index'
import useSWRMutation from 'swr/mutation'

import { CategorizationRuleSchema, type PatchCategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { patch } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useCategorizationRulesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const UPDATE_CATEGORIZATION_RULE_TAG = '#update-categorization-rule'

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
      tags: [UPDATE_CATEGORIZATION_RULE_TAG],
    }
  }
}

const UpdateCategorizationRuleReturnSchema = Schema.Struct({
  data: CategorizationRuleSchema,
})

type UpdateCategorizationRuleReturn = typeof UpdateCategorizationRuleReturnSchema.Type
type UpdateCategorizationRuleBody = typeof PatchCategorizationRuleSchema.Encoded

const updateCategorizationRule = patch<UpdateCategorizationRuleReturn, UpdateCategorizationRuleBody>(
  ({ businessId, categorizationRuleId }) =>
    `/v1/businesses/${businessId}/categorization-rules/${categorizationRuleId}`,
)

type UpdateCategorizationRuleArg = {
  categorizationRuleId: string
  body: UpdateCategorizationRuleBody
}

export function useUpdateCategorizationRule() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReloadCategorizationRules } = useCategorizationRulesGlobalCacheActions()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { categorizationRuleId, body } }: { arg: UpdateCategorizationRuleArg },
    ) => updateCategorizationRule(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          categorizationRuleId,
        },
        body,
      },
    ).then(Schema.decodeUnknownPromise(UpdateCategorizationRuleReturnSchema)),
    {
      revalidate: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)
      void forceReloadCategorizationRules()
      return triggerResult
    },
    [originalTrigger, forceReloadCategorizationRules],
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
