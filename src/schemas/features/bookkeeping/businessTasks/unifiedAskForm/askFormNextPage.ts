import { pipe, Schema } from 'effect'

import { AskFormAnswersSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'
import { AskFormStaticNextSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'

export const AskFormNextPageRequestSchema = Schema.Struct({
  pageId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('page_id'),
  ),
  pageHistory: pipe(
    Schema.propertySignature(Schema.Array(Schema.String)),
    Schema.fromKey('page_history'),
  ),
  answers: AskFormAnswersSchema,
})

export type AskFormNextPageRequest = typeof AskFormNextPageRequestSchema.Type
export type AskFormNextPageRequestEncoded = typeof AskFormNextPageRequestSchema.Encoded

export const AskFormNextPageResultSchema = Schema.Struct({
  next: AskFormStaticNextSchema,
})

export type AskFormNextPageResult = typeof AskFormNextPageResultSchema.Type
