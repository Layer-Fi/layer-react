import { pipe, Schema } from 'effect'

import { S3PresignedUrlSchema } from '@schemas/common/s3PresignedUrl'

export enum BusinessTaskStatus {
  Todo = 'TODO',
  UserMarkedCompleted = 'USER_MARKED_COMPLETED',
  Completed = 'COMPLETED',
  Archived = 'ARCHIVED',
}

export const BusinessTaskStatusSchema = Schema.Enums(BusinessTaskStatus)

const TransformedBusinessTaskStatusSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(BusinessTaskStatusSchema),
  {
    decode: (input) => {
      if (Object.values(BusinessTaskStatusSchema.enums).includes(input as BusinessTaskStatus)) {
        return input as BusinessTaskStatus
      }

      return BusinessTaskStatus.Todo
    },
    encode: input => input,
  },
)

export enum TaskUserResponseType {
  FreeResponse = 'FREE_RESPONSE',
  UploadDocument = 'UPLOAD_DOCUMENT',
  Unknown = 'UNKNOWN',
}

export const TaskUserResponseTypeSchema = Schema.Enums(TaskUserResponseType)

const TransformedTaskUserResponseTypeSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(TaskUserResponseTypeSchema),
  {
    decode: (input) => {
      if (Object.values(TaskUserResponseTypeSchema.enums).includes(input as TaskUserResponseType)) {
        return input as TaskUserResponseType
      }

      return TaskUserResponseType.Unknown
    },
    encode: input => input,
  },
)

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

// We currently treat every business task as a human task; the automated task
// automated variants are not yet surfaced in the UI.
export const BusinessTaskSchema = Schema.Struct({
  id: Schema.UUID,
  status: TransformedBusinessTaskStatusSchema,
  title: Schema.String,
  question: Schema.String,
  userResponse: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('user_response'),
  ),
  userResponseType: pipe(
    Schema.propertySignature(TransformedTaskUserResponseTypeSchema),
    Schema.fromKey('user_response_type'),
  ),
  documents: Schema.NullishOr(Schema.Array(TaskDocumentSchema)),
})

export type BusinessTask = typeof BusinessTaskSchema.Type
export type BusinessTaskEncoded = typeof BusinessTaskSchema.Encoded
