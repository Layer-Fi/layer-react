import { Schema } from 'effect'

import { AskFormAnswersRequestSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'

export const UnifiedAskFormSubmissionSchema = Schema.Struct({
  answers: AskFormAnswersRequestSchema,
})

export type UnifiedAskFormSubmission = typeof UnifiedAskFormSubmissionSchema.Type
export type UnifiedAskFormSubmissionEncoded = typeof UnifiedAskFormSubmissionSchema.Encoded
