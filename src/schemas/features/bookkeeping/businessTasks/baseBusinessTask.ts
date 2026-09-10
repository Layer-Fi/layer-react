import { Schema } from 'effect'

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
export const LEGACY_BUSINESS_TASK_TYPE = 'HUMAN'

export const BaseBusinessTaskSchema = Schema.Struct({
  id: Schema.UUID,
  status: TransformedBusinessTaskStatusSchema,
  title: Schema.String,
  question: Schema.String,
})
