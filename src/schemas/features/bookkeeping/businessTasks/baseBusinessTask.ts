import { pipe, Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/common/utils'

export enum BusinessTaskStatus {
  Todo = 'TODO',
  UserMarkedCompleted = 'USER_MARKED_COMPLETED',
  Completed = 'COMPLETED',
  Archived = 'ARCHIVED',
}

export const BusinessTaskStatusSchema = Schema.Enums(BusinessTaskStatus)

export const TransformedBusinessTaskStatusSchema = createTransformedEnumSchema(
  BusinessTaskStatusSchema,
  BusinessTaskStatus,
  BusinessTaskStatus.Todo,
)

export enum TaskUserResponseType {
  FreeResponse = 'FREE_RESPONSE',
  UploadDocument = 'UPLOAD_DOCUMENT',
  Unknown = 'UNKNOWN',
}

export const TaskUserResponseTypeSchema = Schema.Enums(TaskUserResponseType)

export const TransformedTaskUserResponseTypeSchema = createTransformedEnumSchema(
  TaskUserResponseTypeSchema,
  TaskUserResponseType,
  TaskUserResponseType.Unknown,
)

export const COUNTERPARTY_ASK_TASK_TYPE = 'ASK_ABOUT_COUNTERPARTY_FOR_PERIOD'

// Only id and status are guaranteed across every arm: the unknown arm models task
// types this union can't yet describe, and those may omit title and question.
export const TaskIdentitySchema = Schema.Struct({
  id: Schema.UUID,
  status: TransformedBusinessTaskStatusSchema,
})

export const BaseBusinessTaskSchema = Schema.extend(
  TaskIdentitySchema,
  Schema.Struct({
    title: Schema.String,
    question: Schema.String,
  }),
)

export const UserResponseFromKey = pipe(
  Schema.propertySignature(Schema.NullishOr(Schema.String)),
  Schema.fromKey('user_response'),
)
