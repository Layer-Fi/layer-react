import { Option, pipe, Schema } from 'effect'

const AskFormDocumentSchema = Schema.Struct({
  id: Schema.UUID,
  fileName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('file_name'),
  ),
})

export type AskFormDocument = typeof AskFormDocumentSchema.Type

const UploadTypeSchema = Schema.Literal('Unified_Ask_Form_Upload')

export const AskFormUploadResultSchema = Schema.Struct({
  // Required on the wire, optional when decoded so callers and mock overrides can omit it.
  type: Schema.requiredToOptional(UploadTypeSchema, UploadTypeSchema, {
    decode: Option.some,
    encode: Option.getOrElse(() => UploadTypeSchema.literals[0]),
  }),
  documents: Schema.Array(AskFormDocumentSchema),
})

export type AskFormUploadResult = typeof AskFormUploadResultSchema.Type
