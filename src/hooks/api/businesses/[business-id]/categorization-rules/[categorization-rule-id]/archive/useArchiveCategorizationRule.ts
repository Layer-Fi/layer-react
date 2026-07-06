import { CategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useCategorizationRulesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
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

export const useArchiveCategorizationRule = createMutationHook({
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
