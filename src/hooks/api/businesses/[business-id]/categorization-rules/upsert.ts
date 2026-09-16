import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'
import { usePatchCategorizationRule } from '@api/businesses/[business-id]/categorization-rules/[categorization-rule-id]/patch'
import { usePostCategorizationRule } from '@api/businesses/[business-id]/categorization-rules/post'

export const useUpsertCategorizationRule = createUpsertHook({
  useCreate: usePostCategorizationRule,
  useUpdate: usePatchCategorizationRule,
  toCreateOptions: () => undefined,
  toUpdateOptions: (props: { categorizationRuleId: string }) => ({
    categorizationRuleId: props.categorizationRuleId,
  }),
})
