import { pipe, Schema } from 'effect'

import { TaskIdentitySchema } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'

export const UnknownBusinessTaskSchema = Schema.extend(
  TaskIdentitySchema,
  Schema.Struct({
    title: Schema.optionalWith(Schema.String, { default: () => '', nullable: true }),
    taskType: pipe(
      Schema.optionalWith(Schema.NullishOr(Schema.String), { default: () => null }),
      Schema.fromKey('task_type'),
    ),
  }),
)

export type UnknownBusinessTask = typeof UnknownBusinessTaskSchema.Type
export type UnknownBusinessTaskEncoded = typeof UnknownBusinessTaskSchema.Encoded
