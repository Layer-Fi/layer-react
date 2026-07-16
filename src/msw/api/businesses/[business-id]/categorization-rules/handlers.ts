import { type RequestHandler } from 'msw'

import { post as archiveCategorizationRule } from '@msw/api/businesses/[business-id]/categorization-rules/[categorization-rule-id]/archive/post'
import { patch as patchCategorizationRule } from '@msw/api/businesses/[business-id]/categorization-rules/[categorization-rule-id]/patch'
import { get as getCategorizationRules } from '@msw/api/businesses/[business-id]/categorization-rules/get'
import { post as createCategorizationRule } from '@msw/api/businesses/[business-id]/categorization-rules/post'
import { del as rejectCategorizationRuleSuggestion } from '@msw/api/businesses/[business-id]/categorization-rules/suggestions/[suggestion-id]/delete'

export const categorizationRulesHandlers: RequestHandler[] = [
  getCategorizationRules.handler,
  createCategorizationRule.handler,
  patchCategorizationRule.handler,
  archiveCategorizationRule.handler,
  rejectCategorizationRuleSuggestion.handler,
]
