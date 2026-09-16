import { Schema } from 'effect'

import {
  type CounterpartyAskTask,
  CounterpartyAskTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import {
  type LegacyBusinessTask,
  LegacyBusinessTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'
import { UnknownBusinessTaskSchema } from '@schemas/features/bookkeeping/businessTasks/unknownBusinessTask'

export const BusinessTaskSchema = Schema.Union(
  CounterpartyAskTaskSchema,
  LegacyBusinessTaskSchema,
  UnknownBusinessTaskSchema,
)

export type BusinessTask = typeof BusinessTaskSchema.Type
export type BusinessTaskEncoded = typeof BusinessTaskSchema.Encoded

const isCounterpartyAskTaskShape = Schema.is(CounterpartyAskTaskSchema)
const isLegacyBusinessTaskShape = Schema.is(LegacyBusinessTaskSchema)

export const isCounterpartyAskTask = <T extends BusinessTask>(
  task: T,
): task is T & CounterpartyAskTask => isCounterpartyAskTaskShape(task)

export const isLegacyBusinessTask = <T extends BusinessTask>(
  task: T,
): task is T & LegacyBusinessTask => isLegacyBusinessTaskShape(task)

export const isRenderableBusinessTask = <T extends BusinessTask>(
  task: T,
): task is T & (CounterpartyAskTask | LegacyBusinessTask) =>
  isCounterpartyAskTask(task) || isLegacyBusinessTask(task)
