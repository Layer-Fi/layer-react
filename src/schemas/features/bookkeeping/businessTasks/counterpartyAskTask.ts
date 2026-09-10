import { pipe, Schema } from 'effect'

import { AccountIdentifierSchema } from '@schemas/common/accountIdentifier'
import {
  BankTransactionCounterpartySchema,
  MinimalBankTransactionSchema,
} from '@schemas/features/bankTransactions/base'
import {
  BaseBusinessTaskSchema,
  COUNTERPARTY_ASK_TASK_TYPE,
} from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'

export const CounterpartyAskAccountSchema = Schema.Struct({
  accountIdentifier: pipe(
    Schema.propertySignature(AccountIdentifierSchema),
    Schema.fromKey('account_identifier'),
  ),
  name: Schema.String,
})

export type CounterpartyAskAccount = typeof CounterpartyAskAccountSchema.Type

const CounterpartyAskTransactionResponseSchema = Schema.Struct({
  transactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('transaction_id'),
  ),
  userResponse: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('user_response'),
  ),
  responseAccount: pipe(
    Schema.propertySignature(Schema.NullishOr(CounterpartyAskAccountSchema)),
    Schema.fromKey('response_account'),
  ),
})

export type CounterpartyAskTransactionResponse = typeof CounterpartyAskTransactionResponseSchema.Type

export const CounterpartyAskTaskSchema = Schema.extend(
  BaseBusinessTaskSchema,
  Schema.Struct({
    taskType: pipe(
      Schema.propertySignature(Schema.Literal(COUNTERPARTY_ASK_TASK_TYPE)),
      Schema.fromKey('task_type'),
    ),
    counterparty: Schema.NullishOr(BankTransactionCounterpartySchema),
    suggestions: Schema.optionalWith(Schema.Array(CounterpartyAskAccountSchema), {
      default: () => [],
      nullable: true,
    }),
    transactions: Schema.optionalWith(Schema.Array(MinimalBankTransactionSchema), {
      default: () => [],
      nullable: true,
    }),
    transactionResponses: pipe(
      Schema.optionalWith(Schema.Array(CounterpartyAskTransactionResponseSchema), {
        default: () => [],
        nullable: true,
      }),
      Schema.fromKey('transaction_responses'),
    ),
    userResponse: pipe(
      Schema.propertySignature(Schema.NullishOr(Schema.String)),
      Schema.fromKey('user_response'),
    ),
    responseAccount: pipe(
      Schema.propertySignature(Schema.NullishOr(CounterpartyAskAccountSchema)),
      Schema.fromKey('response_account'),
    ),
    totalCount: pipe(
      Schema.optionalWith(Schema.Number, { default: () => 0, nullable: true }),
      Schema.fromKey('total_count'),
    ),
    totalAmount: pipe(
      Schema.optionalWith(Schema.Number, { default: () => 0, nullable: true }),
      Schema.fromKey('total_amount'),
    ),
    alwaysThis: pipe(
      Schema.optionalWith(Schema.Boolean, { default: () => false, nullable: true }),
      Schema.fromKey('always_this'),
    ),
    resolvedByTaskId: pipe(
      Schema.propertySignature(Schema.NullishOr(Schema.String)),
      Schema.fromKey('resolved_by_task_id'),
    ),
  }),
)

export type CounterpartyAskTask = typeof CounterpartyAskTaskSchema.Type
export type CounterpartyAskTaskEncoded = typeof CounterpartyAskTaskSchema.Encoded
