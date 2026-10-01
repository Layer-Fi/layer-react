import { Schema } from 'effect'

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

export const isCounterpartyAskTask = <T extends BusinessTask>(
  task: T,
): task is T & CounterpartyAskTask => isCounterpartyAskTaskShape(task)

export const isP2PCounterpartyAskTask = <T extends BusinessTask>(
  task: T,
): task is T & P2PCounterpartyAskTask => isP2PCounterpartyAskTaskShape(task)

export const isAnyCounterpartyAskTask = <T extends BusinessTask>(
  task: T,
): task is T & AnyCounterpartyAskTask => isCounterpartyAskTask(task) || isP2PCounterpartyAskTask(task)

export const isLegacyBusinessTask = <T extends BusinessTask>(
  task: T,
): task is T & LegacyBusinessTask => isLegacyBusinessTaskShape(task)

export const isRenderableBusinessTask = <T extends BusinessTask>(
  task: T,
): task is T & (CounterpartyAskTask | LegacyBusinessTask) =>
  isCounterpartyAskTask(task) || isLegacyBusinessTask(task)
