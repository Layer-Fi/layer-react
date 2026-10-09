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
  type UnifiedAskFormTask,
  UnifiedAskFormTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { UnknownBusinessTaskSchema } from '@schemas/features/bookkeeping/businessTasks/unknownBusinessTask'

export const BusinessTaskSchema = Schema.Union(
  UnifiedAskFormTaskSchema,
  CounterpartyAskTaskSchema,
  LegacyBusinessTaskSchema,
  UnknownBusinessTaskSchema,
)

export type BusinessTask = typeof BusinessTaskSchema.Type
export type BusinessTaskEncoded = typeof BusinessTaskSchema.Encoded

const isUnifiedAskFormTaskShape = Schema.is(UnifiedAskFormTaskSchema)
const isCounterpartyAskTaskShape = Schema.is(CounterpartyAskTaskSchema)
const isLegacyBusinessTaskShape = Schema.is(LegacyBusinessTaskSchema)

export const isUnifiedAskFormTask = <T extends BusinessTask>(
  task: T,
): task is T & UnifiedAskFormTask => isUnifiedAskFormTaskShape(task)

export const isCounterpartyAskTask = <T extends BusinessTask>(
  task: T,
): task is T & CounterpartyAskTask => isCounterpartyAskTaskShape(task)

export const isLegacyBusinessTask = <T extends BusinessTask>(
  task: T,
): task is T & LegacyBusinessTask => isLegacyBusinessTaskShape(task)

export const isRenderableBusinessTask = <T extends BusinessTask>(
  task: T,
): task is T & (UnifiedAskFormTask | CounterpartyAskTask | LegacyBusinessTask) =>
  isUnifiedAskFormTask(task) || isCounterpartyAskTask(task) || isLegacyBusinessTask(task)
