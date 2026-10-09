import { Schema } from 'effect'

import {
  type UnifiedAskFormTask,
  UnifiedAskFormTaskSchema,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { UnknownBusinessTaskSchema } from '@schemas/features/bookkeeping/businessTasks/unknownBusinessTask'

export const BusinessTaskSchema = Schema.Union(
  UnifiedAskFormTaskSchema,
  UnknownBusinessTaskSchema,
)

export type BusinessTask = typeof BusinessTaskSchema.Type

const isUnifiedAskFormTaskShape = Schema.is(UnifiedAskFormTaskSchema)

export const isUnifiedAskFormTask = <T extends BusinessTask>(
  task: T,
): task is T & UnifiedAskFormTask => isUnifiedAskFormTaskShape(task)
