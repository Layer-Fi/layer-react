import { Schema } from 'effect'

export const UpdateConnectionStatusBodySchema = Schema.Struct({
  connectionExternalId: Schema.optional(Schema.String).pipe(Schema.fromKey('connection_external_id')),
})

export type UpdateConnectionStatusBody = typeof UpdateConnectionStatusBodySchema.Type
