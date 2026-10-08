import { pipe, Schema } from 'effect'

export const ACCOUNT_OPTION_PREFIX = 'acct_'

const isUuid = Schema.is(Schema.UUID)

const hasAccountId = (value: string) => value.startsWith(ACCOUNT_OPTION_PREFIX) && isUuid(value.slice(ACCOUNT_OPTION_PREFIX.length))

export const AccountOptionValueSchema = Schema.String.pipe(Schema.filter(hasAccountId))

export const isAccountOptionValue = Schema.is(AccountOptionValueSchema)

const makeAskFormAnswerSchemas = (text: Schema.Schema<string>, choice: Schema.Schema<string>) => {
  const textAnswer = Schema.Struct({ text })

  const followUpAnswer = Schema.Union(Schema.Struct({ choice }), textAnswer)

  const choiceAnswer = Schema.Struct({
    choice,
    followUp: pipe(
      Schema.optionalWith(followUpAnswer, { nullable: true }),
      Schema.fromKey('follow_up'),
    ),
  })

  const rowAnswer = Schema.Union(choiceAnswer, textAnswer)

  const transactionAnswer = Schema.Struct({
    transactionId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('transaction_id'),
    ),
    answer: rowAnswer,
  })

  const transactionAnswers = Schema.Struct({
    transactionAnswers: pipe(
      Schema.propertySignature(Schema.Array(transactionAnswer)),
      Schema.fromKey('transaction_answers'),
    ),
  })

  return { textAnswer, followUpAnswer, choiceAnswer, rowAnswer, transactionAnswer, transactionAnswers }
}

// The API checks these rules on requests only; answers it returns are rebuilt from legacy task fields.
const answerSchemas = makeAskFormAnswerSchemas(Schema.String, Schema.String)
const requestAnswerSchemas = makeAskFormAnswerSchemas(
  Schema.String.pipe(Schema.filter(text => text.trim().length > 0 || 'text must not be blank')),
  Schema.String.pipe(Schema.filter(choice =>
    !choice.startsWith(ACCOUNT_OPTION_PREFIX) || hasAccountId(choice) || `Invalid acct id: ${choice}`)),
)

const AskFormTextAnswerSchema = answerSchemas.textAnswer

const AskFormDocumentsAnswerSchema = Schema.Struct({
  documentIds: pipe(
    Schema.propertySignature(Schema.Array(Schema.String)),
    Schema.fromKey('document_ids'),
  ),
})

const AskFormCompletedAnswerSchema = Schema.Struct({
  completed: Schema.Literal(true),
})

export type AskFormFollowUpAnswer = typeof answerSchemas.followUpAnswer.Type

const AskFormChoiceAnswerSchema = answerSchemas.choiceAnswer

export type AskFormChoiceAnswer = typeof AskFormChoiceAnswerSchema.Type

export type AskFormRowAnswer = typeof answerSchemas.rowAnswer.Type

export type AskFormTransactionAnswer = typeof answerSchemas.transactionAnswer.Type

const AskFormTransactionAnswersSchema = answerSchemas.transactionAnswers

export const isChoiceAnswer = Schema.is(AskFormChoiceAnswerSchema)
export const isTextAnswer = Schema.is(AskFormTextAnswerSchema)
export const isDocumentsAnswer = Schema.is(AskFormDocumentsAnswerSchema)
export const isTransactionAnswers = Schema.is(AskFormTransactionAnswersSchema)

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

const AskFormAnswerRequestSchema = Schema.Union(
  requestAnswerSchemas.choiceAnswer,
  requestAnswerSchemas.textAnswer,
  AskFormCompletedAnswerSchema,
  AskFormDocumentsAnswerSchema.pipe(
    Schema.filter(({ documentIds }) => documentIds.length > 0 || 'document_ids must not be empty'),
  ),
  requestAnswerSchemas.transactionAnswers.pipe(
    Schema.filter(({ transactionAnswers }) => {
      const ids = transactionAnswers.map(({ transactionId }) => transactionId)

      if (ids.length === 0) return 'transaction_answers must not be empty'
      return new Set(ids).size === ids.length || 'Duplicate transaction answers'
    }),
  ),
)

export const AskFormAnswersRequestSchema = Schema.Record({ key: Schema.String, value: AskFormAnswerRequestSchema })
