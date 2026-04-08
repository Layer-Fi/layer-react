import { pipe, Schema } from 'effect'

export const BusinessSchema = Schema.Struct({
  id: Schema.UUID,

  activationAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('activation_at'),
  ),
})

export type Business = typeof BusinessSchema.Type

export const BusinessResponseSchema = Schema.Struct({
  data: BusinessSchema,
})
