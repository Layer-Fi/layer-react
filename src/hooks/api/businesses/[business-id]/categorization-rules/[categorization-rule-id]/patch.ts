import { patch } from '@utils/api/authenticatedHttp'
import { useCategorizationRulesGlobalCacheActions } from '@api/businesses/[business-id]/categorization-rules/get'
import {
  UPSERT_CATEGORIZATION_RULE_TAG,
  type UpsertCategorizationRuleBody,
  type UpsertCategorizationRuleReturnEncoded,
  UpsertCategorizationRuleReturnSchema,
} from '@api/businesses/[business-id]/categorization-rules/post'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const updateCategorizationRule = patch<
  UpsertCategorizationRuleReturnEncoded,
  UpsertCategorizationRuleBody,
  { businessId: string, categorizationRuleId: string }
>(
  ({ businessId, categorizationRuleId }) =>
    `/v1/businesses/${businessId}/categorization-rules/${categorizationRuleId}`,
)

export const usePatchCategorizationRule = createMutationHook({
  tags: [UPSERT_CATEGORIZATION_RULE_TAG],
  request: updateCategorizationRule,
  keyParams: ['categorizationRuleId'],
  schema: UpsertCategorizationRuleReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchCategorizationRuleByKey } = useCategorizationRulesGlobalCacheActions()

    return (data) => {
      void patchCategorizationRuleByKey(data)
    }
  },
})
