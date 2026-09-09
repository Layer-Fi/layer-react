import { pipe, Schema } from 'effect'

import { AccountIdentifierSchema } from '@schemas/common/accountIdentifier'

const CounterpartyAskAnswerSchema = Schema.Union(
  Schema.Struct({
    accountIdentifier: pipe(
      Schema.propertySignature(AccountIdentifierSchema),
      Schema.fromKey('account_identifier'),
    ),
  }),
  Schema.Struct({
    userResponse: pipe(
      Schema.propertySignature(Schema.NonEmptyTrimmedString),
      Schema.fromKey('user_response'),
    ),
  }),
)

export type CounterpartyAskAnswer = typeof CounterpartyAskAnswerSchema.Type

const CounterpartyAskTransactionAnswerSchema = Schema.extend(
  Schema.Struct({
    transactionId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('transaction_id'),
    ),
  }),
  CounterpartyAskAnswerSchema,
)

export type CounterpartyAskTransactionAnswer = typeof CounterpartyAskTransactionAnswerSchema.Type

const AllSameCounterpartyAskResponseSchema = Schema.extend(
  Schema.Struct({
    alwaysThis: pipe(
      Schema.propertySignature(Schema.Boolean),
      Schema.fromKey('always_this'),
    ),
  }),
  CounterpartyAskAnswerSchema,
)

const ItemisedCounterpartyAskResponseSchema = Schema.Struct({
  transactionResponses: pipe(
    Schema.propertySignature(Schema.NonEmptyArray(CounterpartyAskTransactionAnswerSchema)),
    Schema.fromKey('transaction_responses'),
  ),
})

export const CounterpartyAskResponseSchema = Schema.Union(
  AllSameCounterpartyAskResponseSchema,
  ItemisedCounterpartyAskResponseSchema,
)

export type CounterpartyAskResponse = typeof CounterpartyAskResponseSchema.Type
export type CounterpartyAskResponseEncoded = typeof CounterpartyAskResponseSchema.Encoded
