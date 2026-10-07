import { Schema } from 'effect'

import { AskFormAnswersSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'

export const UnifiedAskFormSubmissionSchema = Schema.Struct({
  answers: AskFormAnswersSchema,
})

export type UnifiedAskFormSubmission = typeof UnifiedAskFormSubmissionSchema.Type
export type UnifiedAskFormSubmissionEncoded = typeof UnifiedAskFormSubmissionSchema.Encoded
