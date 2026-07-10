import { del } from '@utils/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const REJECT_CATEGORIZATION_RULE_SUGGESTION_TAG = '#reject-categorization-rule-suggestion'

export const rejectCategorizationRulesUpdateSuggestion = del<
  never,
  Record<string, unknown>,
  { businessId: string, suggestionId: string }
>(
  ({ businessId, suggestionId }) =>
    `/v1/businesses/${businessId}/categorization-rules/suggestions/${suggestionId}`,
)

export const useRejectCategorizationRulesUpdateSuggestion = createMutationHook({
  tags: [REJECT_CATEGORIZATION_RULE_SUGGESTION_TAG],
  request: rejectCategorizationRulesUpdateSuggestion,
  argToParams: (suggestionId: string) => ({ suggestionId }),
  argToBody: () => undefined,
})
