import { type CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'

import { toCategorizationRuleResponse } from '@msw/api/businesses/[business-id]/categorization-rules/post'
import { ruleFromPatchRequest } from '@msw/api/businesses/[business-id]/categorization-rules/ruleFromUpsertRequest'
import { categorizationRuleStore } from '@msw/api/businesses/[business-id]/categorization-rules/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreUpdateResolver } from '@msw/utils/createStoreResolvers'
import { makeCategorizationRule } from '@fixtures/categorizationRules/mocks'

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
