import { post } from '../../api/layer/authenticated_http'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import useSWRMutation from 'swr/mutation'
import { useCallback } from 'react'
import { CategorizationRuleSchema } from '../../schemas/bankTransactions/categorizationRules/categorizationRule'
import { Schema } from 'effect/index'
import { useCategorizationRulesGlobalCacheActions } from './useListCategorizationRules'

const ARCHIVE_CATEGORIZATION_RULE_TAG = '#archive-categorization-rule'

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
      tags: [ARCHIVE_CATEGORIZATION_RULE_TAG],
    }
  }
}

const ArchiveCategorizationRuleReturnSchema = Schema.Struct({
  data: CategorizationRuleSchema,
})

type ArchiveCategorizationRuleReturn = typeof ArchiveCategorizationRuleReturnSchema.Type

export const archiveCategorizationRule = post<ArchiveCategorizationRuleReturn>(
  ({ businessId, categorizationRuleId }) =>
    `/v1/businesses/${businessId}/categorization-rules/${categorizationRuleId}/archive`,
)

export function useArchiveCategorizationRule() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReloadCategorizationRules } = useCategorizationRulesGlobalCacheActions()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: categorizationRuleId }: { arg: string },
    ) => archiveCategorizationRule(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          categorizationRuleId,
        },
      },
    ).then(Schema.decodeUnknownPromise(ArchiveCategorizationRuleReturnSchema)),
    {
      revalidate: false,
    },
  )
  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)
      await triggerResultPromise
      void forceReloadCategorizationRules()
      return triggerResultPromise
    }, [forceReloadCategorizationRules, originalTrigger],
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
