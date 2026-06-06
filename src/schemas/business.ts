import { pipe, Schema } from 'effect'

export const BusinessSchema = Schema.Struct({
  id: Schema.UUID,

  activationAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('activation_at'),
  ),

  isDemo: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_demo'),
  ),
})

export type Business = typeof BusinessSchema.Type

export const BusinessResponseSchema = Schema.Struct({
  data: BusinessSchema,
})
