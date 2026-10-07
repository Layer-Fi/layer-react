import { pipe, Schema } from 'effect'

const AskFormTextAnswerSchema = Schema.Struct({
  text: Schema.String,
})

const AskFormDocumentsAnswerSchema = Schema.Struct({
  documentIds: pipe(
    Schema.propertySignature(Schema.Array(Schema.String)),
    Schema.fromKey('document_ids'),
  ),
})

const AskFormCompletedAnswerSchema = Schema.Struct({
  completed: Schema.Literal(true),
})

const AskFormFollowUpAnswerSchema = Schema.Union(
  Schema.Struct({ choice: Schema.String }),
  AskFormTextAnswerSchema,
  AskFormDocumentsAnswerSchema,
)

export type AskFormFollowUpAnswer = typeof AskFormFollowUpAnswerSchema.Type

const AskFormChoiceAnswerSchema = Schema.Struct({
  choice: Schema.String,
  followUp: pipe(
    Schema.optional(AskFormFollowUpAnswerSchema),
    Schema.fromKey('follow_up'),
  ),
})

export type AskFormChoiceAnswer = typeof AskFormChoiceAnswerSchema.Type

const AskFormRowAnswerSchema = Schema.Union(AskFormChoiceAnswerSchema, AskFormTextAnswerSchema)

export type AskFormRowAnswer = typeof AskFormRowAnswerSchema.Type

const AskFormTransactionAnswerSchema = Schema.Struct({
  transactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('transaction_id'),
  ),
  answer: AskFormRowAnswerSchema,
})

export type AskFormTransactionAnswer = typeof AskFormTransactionAnswerSchema.Type

const AskFormTransactionAnswersSchema = Schema.Struct({
  transactionAnswers: pipe(
    Schema.propertySignature(Schema.Array(AskFormTransactionAnswerSchema)),
    Schema.fromKey('transaction_answers'),
  ),
})

export const AskFormAnswerSchema = Schema.Union(
  AskFormChoiceAnswerSchema,
  AskFormTextAnswerSchema,
  AskFormCompletedAnswerSchema,
  AskFormDocumentsAnswerSchema,
  AskFormTransactionAnswersSchema,
)

export type AskFormAnswer = typeof AskFormAnswerSchema.Type

export const AskFormAnswersSchema = Schema.Record({ key: Schema.String, value: AskFormAnswerSchema })

export type AskFormAnswers = typeof AskFormAnswersSchema.Type
export type AskFormAnswersEncoded = typeof AskFormAnswersSchema.Encoded
