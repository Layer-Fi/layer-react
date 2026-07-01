import { useCallback } from 'react'
import { Schema } from 'effect/index'
import useSWRMutation from 'swr/mutation'

import { CategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useCategorizationRulesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const ARCHIVE_CATEGORIZATION_RULE_TAG = '#archive-categorization-rule'

const buildKey = createBuildKey<{ businessId: string }>([ARCHIVE_CATEGORIZATION_RULE_TAG])

const ArchiveCategorizationRuleReturnSchema = Schema.Struct({
  data: CategorizationRuleSchema,
})

type ArchiveCategorizationRuleReturn = typeof ArchiveCategorizationRuleReturnSchema.Type

export const archiveCategorizationRule = post<ArchiveCategorizationRuleReturn>(
  ({ businessId, categorizationRuleId }) =>
    `/v1/businesses/${businessId}/categorization-rules/${categorizationRuleId}/archive`,
)

export function useArchiveCategorizationRule() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const { forceReload: forceReloadCategorizationRules } = useCategorizationRulesGlobalCacheActions()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
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

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
