import { pipe, Schema } from 'effect'

import { type OneOf } from '@internal-types/utility/oneOf'
import { AccountIdentifierSchema } from '@schemas/common/accountIdentifier'

const AccountAnswerSchema = Schema.Struct({
  accountIdentifier: pipe(
    Schema.propertySignature(AccountIdentifierSchema),
    Schema.fromKey('account_identifier'),
  ),
})

const FreeTextAnswerSchema = Schema.Struct({
  userResponse: pipe(
    Schema.propertySignature(Schema.NonEmptyTrimmedString),
    Schema.fromKey('user_response'),
  ),
})

const CounterpartyAskAnswerSchema = Schema.Union(AccountAnswerSchema, FreeTextAnswerSchema)

export type CounterpartyAskAnswer = OneOf<[
  typeof AccountAnswerSchema.Type,
  typeof FreeTextAnswerSchema.Type,
]>

const CounterpartyAskTransactionAnswerSchema = Schema.extend(
  Schema.Struct({
    transactionId: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('transaction_id'),
    ),
  }),
  CounterpartyAskAnswerSchema,
)

export type CounterpartyAskTransactionAnswer = { transactionId: string } & CounterpartyAskAnswer

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

// Arms are listed flat (not via CounterpartyAskAnswer) so OneOf marks every
// other arm's keys `?: never`; a union arm only contributes its common keys.
export type CounterpartyAskResponse = OneOf<[
  { alwaysThis: boolean } & typeof AccountAnswerSchema.Type,
  { alwaysThis: boolean } & typeof FreeTextAnswerSchema.Type,
  {
    transactionResponses: readonly [CounterpartyAskTransactionAnswer, ...CounterpartyAskTransactionAnswer[]]
  },
]>
export type CounterpartyAskResponseEncoded = typeof CounterpartyAskResponseSchema.Encoded
