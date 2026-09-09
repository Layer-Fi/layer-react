import { Schema } from 'effect'

import { COUNTERPARTY_ASK_TASK_TYPE } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import {
  type CounterpartyAskTask,
  CounterpartyAskTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/counterpartyAskTask'
import {
  type LegacyBusinessTask,
  LegacyBusinessTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/legacyBusinessTask'

export const BusinessTaskSchema = Schema.Union(
  CounterpartyAskTaskSchema,
  LegacyBusinessTaskSchema,
)

export type BusinessTask = typeof BusinessTaskSchema.Type
export type BusinessTaskEncoded = typeof BusinessTaskSchema.Encoded

export const isCounterpartyAskTask = <T extends Pick<BusinessTask, 'taskType'>>(
  task: T,
): task is T & CounterpartyAskTask => task.taskType === COUNTERPARTY_ASK_TASK_TYPE

export const isLegacyBusinessTask = <T extends Pick<BusinessTask, 'taskType'>>(
  task: T,
): task is T & LegacyBusinessTask => task.taskType !== COUNTERPARTY_ASK_TASK_TYPE
