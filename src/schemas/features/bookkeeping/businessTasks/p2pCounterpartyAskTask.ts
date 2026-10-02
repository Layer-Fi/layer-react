import { pipe, Schema } from 'effect'

import { P2P_COUNTERPARTY_ASK_TASK_TYPE } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { BaseCounterpartyAskTaskSchema } from '@schemas/features/bookkeeping/businessTasks/baseCounterpartyAskTask'

const P2PProviderSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
})

const P2PCounterpartySchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  provider: Schema.NullishOr(P2PProviderSchema),
})

export const P2PCounterpartyAskTaskSchema = Schema.extend(
  BaseCounterpartyAskTaskSchema,
  Schema.Struct({
    taskType: pipe(
      Schema.propertySignature(Schema.Literal(P2P_COUNTERPARTY_ASK_TASK_TYPE)),
      Schema.fromKey('task_type'),
    ),
    p2pCounterparty: pipe(
      Schema.propertySignature(Schema.NullishOr(P2PCounterpartySchema)),
      Schema.fromKey('p2p_counterparty'),
    ),
  }),
)

export type P2PCounterpartyAskTask = typeof P2PCounterpartyAskTaskSchema.Type
