import { pipe, Schema } from 'effect'

import { TransformedBusinessTaskStatusSchema } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'

export const UnknownBusinessTaskSchema = Schema.Struct({
  id: Schema.UUID,
  status: TransformedBusinessTaskStatusSchema,
  title: Schema.optionalWith(Schema.String, { default: () => '', nullable: true }),
  taskType: pipe(
    Schema.optionalWith(Schema.NullishOr(Schema.String), { default: () => null }),
    Schema.fromKey('task_type'),
  ),
})

export type UnknownBusinessTask = typeof UnknownBusinessTaskSchema.Type
export type UnknownBusinessTaskEncoded = typeof UnknownBusinessTaskSchema.Encoded
