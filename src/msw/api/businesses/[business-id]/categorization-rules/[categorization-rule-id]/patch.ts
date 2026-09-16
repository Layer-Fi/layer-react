import { type CategorizationRule } from '@schemas/features/categorization/categorizationRule'

import { makeCategorizationRule } from '@fixtures/categorizationRules/mocks'
import { toCategorizationRuleResponse } from '@msw/api/businesses/[business-id]/categorization-rules/post'
import { ruleFromPatchRequest } from '@msw/api/businesses/[business-id]/categorization-rules/ruleFromUpsertRequest'
import { categorizationRuleStore } from '@msw/api/businesses/[business-id]/categorization-rules/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreUpdateResolver } from '@msw/utils/createStoreResolvers'

export const patch = createMockEndpoint<CategorizationRule, ReturnType<typeof toCategorizationRuleResponse>>({
  method: 'patch',
  path: '*/v1/businesses/:businessId/categorization-rules/:categorizationRuleId',
  resolve: createStoreUpdateResolver({
    idParam: 'categorizationRuleId',
    store: categorizationRuleStore,
    makeBase: id => makeCategorizationRule({ id }),
    fromRequest: ruleFromPatchRequest,
    toResponse: toCategorizationRuleResponse,
  }),
})
