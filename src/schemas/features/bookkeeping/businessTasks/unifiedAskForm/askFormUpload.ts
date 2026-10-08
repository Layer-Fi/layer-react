import { pipe, Schema } from 'effect'

const AskFormDocumentSchema = Schema.Struct({
  id: Schema.UUID,
  fileName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('file_name'),
  ),
})

export type AskFormDocument = typeof AskFormDocumentSchema.Type

export const AskFormUploadResultSchema = Schema.Struct({
  documents: Schema.Array(AskFormDocumentSchema),
})

export type AskFormUploadResult = typeof AskFormUploadResultSchema.Type
