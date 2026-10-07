import { pipe, Schema } from 'effect'

import { S3PresignedUrlSchema } from '@schemas/common/s3PresignedUrl'
import {
  BaseBusinessTaskSchema,
  COUNTERPARTY_ASK_TASK_TYPE,
  TransformedTaskUserResponseTypeSchema,
  UserResponseFromKey,
} from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { UNIFIED_ASK_FORM_TASK_TYPE } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'

const TaskDocumentSchema = Schema.Struct({
  fileName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('file_name'),
  ),
  presignedUrl: pipe(
    Schema.propertySignature(S3PresignedUrlSchema),
    Schema.fromKey('presigned_url'),
  ),
})

const NON_LEGACY_TASK_TYPES: ReadonlyArray<string> = [COUNTERPARTY_ASK_TASK_TYPE, UNIFIED_ASK_FORM_TASK_TYPE]

// Only fires for an ask or unified task whose own payload is malformed: a well-formed one
// matches its arm first. Without it such a task decodes as a legacy task and would post a
// free-response answer to it.
const NonCounterpartyAskTaskTypeSchema = Schema.NullishOr(
  Schema.String.pipe(
    Schema.filter(taskType => !NON_LEGACY_TASK_TYPES.includes(taskType), {
      identifier: 'NonCounterpartyAskTaskType',
    }),
  ),
)

export const LegacyBusinessTaskSchema = Schema.extend(
  BaseBusinessTaskSchema,
  Schema.Struct({
    taskType: pipe(
      Schema.optionalWith(NonCounterpartyAskTaskTypeSchema, { default: () => null }),
      Schema.fromKey('task_type'),
    ),
    userResponse: UserResponseFromKey,
    userResponseType: pipe(
      Schema.propertySignature(TransformedTaskUserResponseTypeSchema),
      Schema.fromKey('user_response_type'),
    ),
    documents: Schema.NullishOr(Schema.Array(TaskDocumentSchema)),
  }),
)

export type LegacyBusinessTask = typeof LegacyBusinessTaskSchema.Type
export type LegacyBusinessTaskEncoded = typeof LegacyBusinessTaskSchema.Encoded
