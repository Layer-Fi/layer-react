import { Schema } from 'effect'

import { BankDirectionFilter, type CategorizationRule, CategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'

import { categorizationRuleStore } from '@msw/api/businesses/[business-id]/categorization-rules/store'
import { findAccountByIdentifier } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesQuery } from '@msw/utils/createListFilter'
import { createListSorter } from '@msw/utils/createListSorter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeCategorizationRule = Schema.encodeSync(CategorizationRuleSchema)

const toResponse = (rules: readonly CategorizationRule[], request: Request) =>
  paginatedApiData(rules.map(rule => encodeCategorizationRule(rule)), request)

/* Untranslated - the mock layer has no access to i18n. */
const DIRECTION_TEXT: Record<BankDirectionFilter, string> = {
  [BankDirectionFilter.MONEY_IN]: 'Money In',
  [BankDirectionFilter.MONEY_OUT]: 'Money Out',
}

const filterCategorizationRules = createListFilter<CategorizationRule>({
  include_archived: (rule, value) => value === 'true' || rule.archivedAt == null,
  q: matchesQuery(rule => [
    rule.name,
    rule.bankDirectionFilter == null ? 'Any direction' : DIRECTION_TEXT[rule.bankDirectionFilter],
    rule.counterpartyFilter?.name,
    rule.readableTransactionDescriptionFilter,
    rule.category == null ? undefined : findAccountByIdentifier(rule.category)?.name,
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
