import { Schema, pipe } from 'effect'

export const S3PresignedUrlSchema = Schema.Struct({
  type: Schema.Literal('S3_Presigned_Url'),
  presignedUrl: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('presigned_url'),
  ),
  fileType: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('file_type'),
  ),
  fileName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('file_name'),
  ),
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('created_at'),
  ),
  documentId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('document_id'),
  ),
})

export type S3PresignedUrl = typeof S3PresignedUrlSchema.Type
