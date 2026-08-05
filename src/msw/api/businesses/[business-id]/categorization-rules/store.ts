import { type CategorizationRule } from '@schemas/features/categorization/categorizationRule'

import { categorizationRules } from '@fixtures/categorizationRules/mocks'
import { createMockStore } from '@msw/utils/createMockStore'

export const categorizationRuleStore = createMockStore<CategorizationRule>(
  () => Object.values(categorizationRules),
)
