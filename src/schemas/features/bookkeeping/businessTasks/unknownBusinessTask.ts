import { pipe, Schema } from 'effect'

import {
  BusinessTaskStatus,
  TransformedBusinessTaskStatusSchema,
} from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'

// The catch-all arm for task types this union can't model, so every field is
// loosened: anything stricter would fail all three arms and reject the whole
// periods response, which is what this arm exists to prevent.
export const UnknownBusinessTaskSchema = Schema.Struct({
  id: Schema.String,
  status: Schema.optionalWith(TransformedBusinessTaskStatusSchema, {
    default: () => BusinessTaskStatus.Todo,
    nullable: true,
  }),
  title: Schema.optionalWith(Schema.String, { default: () => '', nullable: true }),
  taskType: pipe(
    Schema.optionalWith(Schema.NullishOr(Schema.String), { default: () => null }),
    Schema.fromKey('task_type'),
  ),
})

export type UnknownBusinessTask = typeof UnknownBusinessTaskSchema.Type
export type UnknownBusinessTaskEncoded = typeof UnknownBusinessTaskSchema.Encoded
