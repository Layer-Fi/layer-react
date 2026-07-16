import { Schema } from 'effect'

import { type CategorizationRule, CategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'

import { categorizationRuleStore } from '@msw/api/businesses/[business-id]/categorization-rules/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter } from '@msw/utils/createListFilter'
import { createListSorter } from '@msw/utils/createListSorter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeCategorizationRule = Schema.encodeSync(CategorizationRuleSchema)

const toResponse = (rules: readonly CategorizationRule[], request: Request) =>
  paginatedApiData(rules.map(rule => encodeCategorizationRule(rule)), request)

const filterCategorizationRules = createListFilter<CategorizationRule>({
  include_archived: (rule, value) => value === 'true' || rule.archivedAt == null,
})

const sortCategorizationRules = createListSorter<CategorizationRule>({
  created_at: rule => rule.createdAt.getTime(),
}, 'created_at')

export const get = createMockEndpoint<readonly CategorizationRule[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/categorization-rules',
  resolve: ({ override: rules = categorizationRuleStore.all(), request }) =>
    toResponse(
      sortCategorizationRules(filterCategorizationRules(rules, request), request),
      request,
    ),
})
