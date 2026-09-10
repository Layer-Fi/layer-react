import { pipe, Schema } from 'effect'

import { S3PresignedUrlSchema } from '@schemas/common/s3PresignedUrl'
import {
  BaseBusinessTaskSchema,
  LEGACY_BUSINESS_TASK_TYPE,
  TransformedTaskUserResponseTypeSchema,
} from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'

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

// Restricted to the one task_type this arm actually models (or absent, for
// payloads that predate task_type) rather than "anything but a counterparty
// ask" - otherwise a future agent-created type reusing this shape would
// silently render as a free-response task instead of falling through to
// UnknownBusinessTaskSchema.
const LegacyTaskTypeSchema = Schema.NullishOr(Schema.Literal(LEGACY_BUSINESS_TASK_TYPE))

export const LegacyBusinessTaskSchema = Schema.extend(
  BaseBusinessTaskSchema,
  Schema.Struct({
    taskType: pipe(
      Schema.optionalWith(LegacyTaskTypeSchema, { default: () => null }),
      Schema.fromKey('task_type'),
    ),
    userResponse: pipe(
      Schema.propertySignature(Schema.NullishOr(Schema.String)),
      Schema.fromKey('user_response'),
    ),
    userResponseType: pipe(
      Schema.propertySignature(TransformedTaskUserResponseTypeSchema),
      Schema.fromKey('user_response_type'),
    ),
    documents: Schema.NullishOr(Schema.Array(TaskDocumentSchema)),
  }),
)

export type LegacyBusinessTask = typeof LegacyBusinessTaskSchema.Type
export type LegacyBusinessTaskEncoded = typeof LegacyBusinessTaskSchema.Encoded
