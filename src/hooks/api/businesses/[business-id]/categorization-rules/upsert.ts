import { usePatchCategorizationRule } from '@api/businesses/[business-id]/categorization-rules/[categorization-rule-id]/patch'
import { usePostCategorizationRule } from '@api/businesses/[business-id]/categorization-rules/post'

export enum UpsertCategorizationRuleMode {
  Create = 'Create',
  Update = 'Update',
}

type UseUpsertCategorizationRuleProps =
  | { mode: UpsertCategorizationRuleMode.Create }
  | { mode: UpsertCategorizationRuleMode.Update, categorizationRuleId: string }

export function useUpsertCategorizationRule(props: UseUpsertCategorizationRuleProps) {
  const { mode } = props
  const categorizationRuleId = mode === UpsertCategorizationRuleMode.Update ? props.categorizationRuleId : undefined

  const createResponse = usePostCategorizationRule()
  const updateResponse = usePatchCategorizationRule({
    categorizationRuleId: categorizationRuleId ?? '',
  })

  return mode === UpsertCategorizationRuleMode.Create ? createResponse : updateResponse
}
