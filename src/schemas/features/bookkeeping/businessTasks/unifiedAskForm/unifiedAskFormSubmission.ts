import { Schema } from 'effect'

import { AskFormAnswersRequestSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'

export const UnifiedAskFormSubmissionSchema = Schema.Struct({
  answers: AskFormAnswersRequestSchema.pipe(
    Schema.filter(answers => Object.keys(answers).length > 0 || 'answers must not be empty'),
  ),
})

export type UnifiedAskFormSubmission = typeof UnifiedAskFormSubmissionSchema.Type
export type UnifiedAskFormSubmissionEncoded = typeof UnifiedAskFormSubmissionSchema.Encoded
