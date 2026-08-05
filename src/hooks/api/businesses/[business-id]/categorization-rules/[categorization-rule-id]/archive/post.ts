import { CategorizationRuleSchema } from '@schemas/categorization/categorizationRule'
import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { post } from '@utils/shared/api/authenticatedHttp'
import { useCategorizationRulesGlobalCacheActions } from '@api/businesses/[business-id]/categorization-rules/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const ARCHIVE_CATEGORIZATION_RULE_TAG = '#archive-categorization-rule'

const ArchiveCategorizationRuleReturnSchema = UnwrappedDataResponseSchema(CategorizationRuleSchema)

export const archiveCategorizationRule = post<
  typeof ArchiveCategorizationRuleReturnSchema.Encoded,
  Record<string, unknown>,
  { businessId: string, categorizationRuleId: string }
>(
  ({ businessId, categorizationRuleId }) =>
    `/v1/businesses/${businessId}/categorization-rules/${categorizationRuleId}/archive`,
)

export const usePostArchiveCategorizationRule = createMutationHook({
  tags: [ARCHIVE_CATEGORIZATION_RULE_TAG],
  request: archiveCategorizationRule,
  argToParams: (categorizationRuleId: string) => ({ categorizationRuleId }),
  argToBody: () => undefined,
  schema: ArchiveCategorizationRuleReturnSchema,
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadCategorizationRules } = useCategorizationRulesGlobalCacheActions()

    return () => {
      void forceReloadCategorizationRules()
    }
  },
})
