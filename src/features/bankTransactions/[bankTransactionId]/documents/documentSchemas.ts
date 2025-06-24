import { Schema } from 'effect'

export const S3PresignedUrlSchema = Schema.Struct({
  presignedUrl: Schema.String,
  fileType: Schema.String,
  fileName: Schema.String,
  createdAt: Schema.Date,
  documentId: Schema.NullOr(Schema.UUID),
})
