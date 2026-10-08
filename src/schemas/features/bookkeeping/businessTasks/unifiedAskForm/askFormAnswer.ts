import { pipe, Schema } from 'effect'

export const ACCOUNT_OPTION_PREFIX = 'acct_'

const isUuid = Schema.is(Schema.UUID)

const hasAccountId = (value: string) => value.startsWith(ACCOUNT_OPTION_PREFIX) && isUuid(value.slice(ACCOUNT_OPTION_PREFIX.length))

export const AccountOptionValueSchema = Schema.String.pipe(Schema.filter(hasAccountId))

export const isAccountOptionValue = Schema.is(AccountOptionValueSchema)

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
)

export type AskFormFollowUpAnswer = typeof AskFormFollowUpAnswerSchema.Type

const AskFormChoiceAnswerSchema = Schema.Struct({
  choice: Schema.String,
  followUp: pipe(
    Schema.optionalWith(AskFormFollowUpAnswerSchema, { nullable: true }),
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

export const isChoiceAnswer = Schema.is(AskFormChoiceAnswerSchema)
export const isTextAnswer = Schema.is(AskFormTextAnswerSchema)
export const isDocumentsAnswer = Schema.is(AskFormDocumentsAnswerSchema)
export const isTransactionAnswers = Schema.is(AskFormTransactionAnswersSchema)
export const isCompletedAnswer = Schema.is(AskFormCompletedAnswerSchema)

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

const findRequestProblem = (answer: AskFormAnswer | AskFormFollowUpAnswer): string | null => {
  if (isChoiceAnswer(answer)) {
    if (answer.choice.startsWith(ACCOUNT_OPTION_PREFIX) && !hasAccountId(answer.choice)) return `Invalid acct id: ${answer.choice}`
    return answer.followUp ? findRequestProblem(answer.followUp) : null
  }
  if (isTextAnswer(answer)) return answer.text.trim() ? null : 'text must not be blank'
  if (isDocumentsAnswer(answer)) return answer.documentIds.length > 0 ? null : 'document_ids must not be empty'
  if (isTransactionAnswers(answer)) {
    const ids = answer.transactionAnswers.map(({ transactionId }) => transactionId)

    if (ids.length === 0) return 'transaction_answers must not be empty'
    if (new Set(ids).size !== ids.length) return 'Duplicate transaction answers'

    return answer.transactionAnswers.map(row => findRequestProblem(row.answer)).find(problem => problem !== null) ?? null
  }

  return null
}

// The API checks these rules on requests only; answers it returns are rebuilt from legacy task fields.
const AskFormAnswerRequestSchema = AskFormAnswerSchema.pipe(Schema.filter(answer => findRequestProblem(answer) ?? true))

export const AskFormAnswersRequestSchema = Schema.Record({ key: Schema.String, value: AskFormAnswerRequestSchema })
