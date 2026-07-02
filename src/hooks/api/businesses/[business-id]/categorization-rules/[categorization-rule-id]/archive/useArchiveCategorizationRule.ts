import { useCallback } from 'react'
import { Schema } from 'effect/index'

import { CategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useCategorizationRulesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const ARCHIVE_CATEGORIZATION_RULE_TAG = '#archive-categorization-rule'

const ArchiveCategorizationRuleReturnSchema = Schema.Struct({
  data: CategorizationRuleSchema,
})

export const archiveCategorizationRule = post<
  typeof ArchiveCategorizationRuleReturnSchema.Encoded,
  Record<string, unknown>,
  { businessId: string, categorizationRuleId: string }
>(
  ({ businessId, categorizationRuleId }) =>
    `/v1/businesses/${businessId}/categorization-rules/${categorizationRuleId}/archive`,
)

const useArchiveCategorizationRuleMutation = createMutationHook({
  tags: [ARCHIVE_CATEGORIZATION_RULE_TAG],
  request: archiveCategorizationRule,
  argToParams: (categorizationRuleId: string) => ({ categorizationRuleId }),
  argToBody: () => undefined,
  schema: ArchiveCategorizationRuleReturnSchema,
})

export function useArchiveCategorizationRule() {
  const { forceReload: forceReloadCategorizationRules } = useCategorizationRulesGlobalCacheActions()

  const mutationResponse = useArchiveCategorizationRuleMutation()
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
