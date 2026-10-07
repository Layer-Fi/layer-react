import { pipe, Schema } from 'effect'

import { AskFormAnswersSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormAnswer'

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

export const ASK_FORM_NEXT_PAGE_SUBMIT = 'SUBMIT'

export const AskFormNextPageResultSchema = Schema.Struct({
  nextPageId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('next_page_id'),
  ),
})

export type AskFormNextPageResult = typeof AskFormNextPageResultSchema.Type
