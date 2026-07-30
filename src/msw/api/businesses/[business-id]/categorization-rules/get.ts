import { Schema } from 'effect'

import { type CategorizationRule, CategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { DIRECTION_CONFIG, getCategorizationRuleCounterpartyLabel } from '@components/CategorizationRules/utils'

import { categorizationRuleStore } from '@msw/api/businesses/[business-id]/categorization-rules/store'
import { ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesQuery } from '@msw/utils/createListFilter'
import { createListSorter } from '@msw/utils/createListSorter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeCategorizationRule = Schema.encodeSync(CategorizationRuleSchema)

const toResponse = (rules: readonly CategorizationRule[], request: Request) =>
  paginatedApiData(rules.map(rule => encodeCategorizationRule(rule)), request)

const directionLabel = ({ bankDirectionFilter }: CategorizationRule) => {
  if (bankDirectionFilter == null) return 'Any direction'

  return DIRECTION_CONFIG.find(({ value }) => value === bankDirectionFilter)?.defaultValue
}

const categoryLabel = ({ category }: CategorizationRule) => {
  if (category == null) return undefined

  const account = ledgerAccountStore.all().find(({ accountId, stableName }) =>
    category.type === 'AccountId' ? accountId === category.id : stableName === category.stableName,
  )

  return account?.name ?? (category.type === 'StableName' ? category.stableName : undefined)
}

const filterCategorizationRules = createListFilter<CategorizationRule>({
  include_archived: (rule, value) => value === 'true' || rule.archivedAt == null,
  q: matchesQuery(rule => [
    rule.name,
    directionLabel(rule),
    getCategorizationRuleCounterpartyLabel(rule),
    categoryLabel(rule),
  ]),
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
