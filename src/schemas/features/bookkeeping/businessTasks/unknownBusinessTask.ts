import { pipe, Schema } from 'effect'

import { TransformedBusinessTaskStatusSchema } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'

export const UnknownBusinessTaskSchema = Schema.Struct({
  id: Schema.UUID,
  status: TransformedBusinessTaskStatusSchema,
  title: Schema.String,
  taskType: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('task_type'),
  ),
})

export type UnknownBusinessTask = typeof UnknownBusinessTaskSchema.Type
export type UnknownBusinessTaskEncoded = typeof UnknownBusinessTaskSchema.Encoded
