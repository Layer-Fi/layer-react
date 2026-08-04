import { Schema } from 'effect'

import { BankTransactionDirectionSchema } from '@schemas/bankTransactions/base'

export const CustomTransactionSchema = Schema.Struct({
  externalId: Schema.optional(Schema.NullishOr(Schema.String)).pipe(
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  direction: BankTransactionDirectionSchema,
  date: Schema.String,
  description: Schema.String,
  referenceNumber: Schema.optional(Schema.NullishOr(Schema.String)).pipe(
    Schema.fromKey('reference_number'),
  ),
})

export type CustomTransaction = typeof CustomTransactionSchema.Type
export type RawCustomTransaction = typeof CustomTransactionSchema.Encoded
