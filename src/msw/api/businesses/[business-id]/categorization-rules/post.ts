import { Schema } from 'effect'

import { type CategorizationRule, CategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'

import { ruleFromCreateRequest } from '@msw/api/businesses/[business-id]/categorization-rules/ruleFromUpsertRequest'
import { categorizationRuleStore } from '@msw/api/businesses/[business-id]/categorization-rules/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeCategorizationRule } from '@fixtures/categorizationRules/mocks'

const encodeCategorizationRule = Schema.encodeSync(CategorizationRuleSchema)

export const toCategorizationRuleResponse = (rule: CategorizationRule) =>
  apiData(encodeCategorizationRule(rule))

const makeBaseRule = (id: string) =>
  makeCategorizationRule({
    id,
    name: null,
    category: null,
    readableTransactionDescriptionFilter: null,
    bankDirectionFilter: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

export const post = createMockEndpoint<CategorizationRule, ReturnType<typeof toCategorizationRuleResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/categorization-rules',
  resolve: createStoreCreateResolver({
    store: categorizationRuleStore,
    makeBase: makeBaseRule,
    fromRequest: ruleFromCreateRequest,
    toResponse: toCategorizationRuleResponse,
  }),
})
