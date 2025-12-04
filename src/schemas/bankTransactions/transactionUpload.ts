import { pipe, Schema } from 'effect/index'

export const TransactionUploadSchema = Schema.Struct({
  id: Schema.String,
  customAccountId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('custom_account_id'),
  ),
  customAccountName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('custom_account_name'),
  ),
  uploadedAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('uploaded_at'),
  ),
  uploadName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('upload_name'),
  ),
  transactionCount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('transaction_count'),
  ),
  archivedAt: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('archived_at'),
  ),
})

export type TransactionUpload = typeof TransactionUploadSchema.Type
export type TransactionUploadEncoded = typeof TransactionUploadSchema.Encoded

export const TransactionUploadsResponseSchema = Schema.Struct({
  data: Schema.Struct({
    type: Schema.Literal('Custom_Transaction_Uploads'),
    uploadData: Schema.Array(TransactionUploadSchema),
  }),
})

export type TransactionUploadsResponse = typeof TransactionUploadsResponseSchema.Type
