import { type CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'

import { toCategorizationRuleResponse } from '@msw/api/businesses/[business-id]/categorization-rules/post'
import { categorizationRuleStore } from '@msw/api/businesses/[business-id]/categorization-rules/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreTransformResolver } from '@msw/utils/createStoreResolvers'
import { makeCategorizationRule } from '@fixtures/categorizationRules/mocks'

export const post = createMockEndpoint<CategorizationRule, ReturnType<typeof toCategorizationRuleResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/categorization-rules/:categorizationRuleId/archive',
  resolve: createStoreTransformResolver({
    idParam: 'categorizationRuleId',
    store: categorizationRuleStore,
    makeBase: id => makeCategorizationRule({ id }),
    transform: rule => ({ ...rule, archivedAt: new Date(), updatedAt: new Date() }),
    toResponse: toCategorizationRuleResponse,
  }),
})
