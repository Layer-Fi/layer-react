import { type CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'

import { createMockStore } from '@msw/utils/createMockStore'
import { categorizationRules } from '@fixtures/categorizationRules/mocks'

export const categorizationRuleStore = createMockStore<CategorizationRule>(
  () => Object.values(categorizationRules),
)
