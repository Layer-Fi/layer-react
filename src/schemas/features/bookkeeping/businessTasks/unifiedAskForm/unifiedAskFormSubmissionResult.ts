import { Schema } from 'effect'

import { UnifiedAskFormTaskSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

export const UnifiedAskFormSubmissionResultSchema = Schema.Struct({
  task: UnifiedAskFormTaskSchema,
  categorized: Schema.Boolean,
})

export type UnifiedAskFormSubmissionResult = typeof UnifiedAskFormSubmissionResultSchema.Type
