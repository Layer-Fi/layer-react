import { Schema } from 'effect'

export const CustomAccountTransactionRowSchema = Schema.Struct({
  date: Schema.String,
  description: Schema.String,
  amount: Schema.Number,
  externalId: Schema.optional(Schema.NullishOr(Schema.String)).pipe(
    Schema.fromKey('external_id'),
  ),
  referenceNumber: Schema.optional(Schema.NullishOr(Schema.String)).pipe(
    Schema.fromKey('reference_number'),
  ),
})

export type CustomAccountTransactionRow = typeof CustomAccountTransactionRowSchema.Type
