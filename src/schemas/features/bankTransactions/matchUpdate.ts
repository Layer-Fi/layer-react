import { pipe, Schema } from 'effect'

export const ConfirmMatchUpdateSchema = Schema.Struct({
  matchId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('match_id'),
  ),
  type: Schema.Literal('Confirm_Match'),
})

export type ConfirmMatchUpdate = typeof ConfirmMatchUpdateSchema.Type
export type ConfirmMatchUpdateEncoded = typeof ConfirmMatchUpdateSchema.Encoded
