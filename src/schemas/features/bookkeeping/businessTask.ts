import { Schema } from 'effect'

import {
  COUNTERPARTY_ASK_TASK_TYPE,
  isCounterpartyAskTaskType,
  P2P_COUNTERPARTY_ASK_TASK_TYPE,
} from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import {
  type CounterpartyAskTask,
  CounterpartyAskTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import {
  type LegacyBusinessTask,
  LegacyBusinessTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'
import {
  type P2PCounterpartyAskTask,
  P2PCounterpartyAskTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/p2pCounterpartyAskTask'
import { UnknownBusinessTaskSchema } from '@schemas/features/bookkeeping/businessTasks/unknownBusinessTask'

export const AnyCounterpartyAskTaskSchema = Schema.Union(
  CounterpartyAskTaskSchema,
  P2PCounterpartyAskTaskSchema,
)

export type AnyCounterpartyAskTask = typeof AnyCounterpartyAskTaskSchema.Type

export const BusinessTaskSchema = Schema.Union(
  CounterpartyAskTaskSchema,
  P2PCounterpartyAskTaskSchema,
  LegacyBusinessTaskSchema,
  UnknownBusinessTaskSchema,
)

export type BusinessTask = typeof BusinessTaskSchema.Type
export type BusinessTaskEncoded = typeof BusinessTaskSchema.Encoded

const isCounterpartyAskTaskShape = Schema.is(CounterpartyAskTaskSchema)
const isP2PCounterpartyAskTaskShape = Schema.is(P2PCounterpartyAskTaskSchema)
const isLegacyBusinessTaskShape = Schema.is(LegacyBusinessTaskSchema)

// `taskType` rules an arm out cheaply; the structural check still has to run because a
// malformed ask decodes through the unknown arm with the same `taskType`.
export const isCounterpartyAskTask = <T extends BusinessTask>(
  task: T,
): task is T & CounterpartyAskTask => task.taskType === COUNTERPARTY_ASK_TASK_TYPE && isCounterpartyAskTaskShape(task)

export const isP2PCounterpartyAskTask = <T extends BusinessTask>(
  task: T,
): task is T & P2PCounterpartyAskTask => task.taskType === P2P_COUNTERPARTY_ASK_TASK_TYPE && isP2PCounterpartyAskTaskShape(task)

export const isAnyCounterpartyAskTask = <T extends BusinessTask>(
  task: T,
): task is T & AnyCounterpartyAskTask => isCounterpartyAskTask(task) || isP2PCounterpartyAskTask(task)

export const isLegacyBusinessTask = <T extends BusinessTask>(
  task: T,
): task is T & LegacyBusinessTask =>
  !(task.taskType != null && isCounterpartyAskTaskType(task.taskType)) && isLegacyBusinessTaskShape(task)

export const isRenderableBusinessTask = <T extends BusinessTask>(
  task: T,
): task is T & (AnyCounterpartyAskTask | LegacyBusinessTask) =>
  isAnyCounterpartyAskTask(task) || isLegacyBusinessTask(task)
