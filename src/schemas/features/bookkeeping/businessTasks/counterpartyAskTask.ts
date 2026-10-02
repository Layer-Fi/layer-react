import { pipe, Schema } from 'effect'

import { BankTransactionCounterpartySchema } from '@schemas/features/bankTransactions/base'
import { COUNTERPARTY_ASK_TASK_TYPE } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { BaseCounterpartyAskTaskSchema } from '@schemas/features/bookkeeping/businessTasks/baseCounterpartyAskTask'

export const CounterpartyAskTaskSchema = Schema.extend(
  BaseCounterpartyAskTaskSchema,
  Schema.Struct({
    taskType: pipe(
      Schema.propertySignature(Schema.Literal(COUNTERPARTY_ASK_TASK_TYPE)),
      Schema.fromKey('task_type'),
    ),
    counterparty: Schema.NullishOr(BankTransactionCounterpartySchema),
  }),
)

export type CounterpartyAskTask = typeof CounterpartyAskTaskSchema.Type
export type CounterpartyAskTaskEncoded = typeof CounterpartyAskTaskSchema.Encoded
