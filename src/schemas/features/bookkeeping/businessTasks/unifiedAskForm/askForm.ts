import { pipe, Schema } from 'effect'

import { AskFormNextSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import { AskFormStepSchema } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'

export const AskFormPageSchema = Schema.Struct({
  id: Schema.String,
  /** Shown under the task title, before the transactions. */
  intro: Schema.optionalWith(Schema.String, { nullable: true }),
  /** Shown after the transactions, before the page's first question. */
  description: Schema.optionalWith(Schema.String, { nullable: true }),
  steps: Schema.Array(AskFormStepSchema),
  next: AskFormNextSchema,
})

export type AskFormPage = typeof AskFormPageSchema.Type

export const AskFormSchema = Schema.Struct({
  entryPageId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_page_id'),
  ),
  pages: Schema.Array(AskFormPageSchema),
})

export type AskForm = typeof AskFormSchema.Type
export type AskFormEncoded = typeof AskFormSchema.Encoded
