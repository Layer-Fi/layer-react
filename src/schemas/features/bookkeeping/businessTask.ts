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
import { UnknownBusinessTaskSchema } from '@schemas/features/bookkeeping/businessTasks/unknownBusinessTask'

export const BusinessTaskSchema = Schema.Union(
  CounterpartyAskTaskSchema,
  LegacyBusinessTaskSchema,
  UnknownBusinessTaskSchema,
)

export type BusinessTask = typeof BusinessTaskSchema.Type
export type BusinessTaskEncoded = typeof BusinessTaskSchema.Encoded

export const isCounterpartyAskTask = <T extends Pick<BusinessTask, 'taskType'>>(
  task: T,
): task is T & CounterpartyAskTask =>
  task.taskType === COUNTERPARTY_ASK_TASK_TYPE && 'transactionResponses' in task

// LegacyBusinessTask always carries user_response_type; UnknownBusinessTask (an
// unrecognised task_type this union can't fully model) never does.
export const isLegacyBusinessTask = <T extends Pick<BusinessTask, 'taskType'>>(
  task: T,
): task is T & LegacyBusinessTask =>
  !isCounterpartyAskTask(task) && 'userResponseType' in task

export const isRenderableBusinessTask = <T extends BusinessTask>(
  task: T,
): task is T & (CounterpartyAskTask | LegacyBusinessTask) =>
  isCounterpartyAskTask(task) || isLegacyBusinessTask(task)
