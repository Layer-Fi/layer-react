import { Schema } from 'effect'

import { BankTransactionDirectionSchema } from '@schemas/features/bankTransactions/base'
import { SingleCategoryUpdateSchema } from '@schemas/features/bankTransactions/categoryUpdate'

export const RecordCustomTransactionSchema = Schema.Struct({
  externalId: Schema.optional(Schema.String).pipe(Schema.fromKey('external_id')),
  amount: Schema.Number,
  direction: BankTransactionDirectionSchema,
  date: Schema.String,
  description: Schema.optional(Schema.String),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  customerId: Schema.optional(Schema.UUID).pipe(Schema.fromKey('customer_id')),
  vendorId: Schema.optional(Schema.UUID).pipe(Schema.fromKey('vendor_id')),
  categorization: Schema.optional(SingleCategoryUpdateSchema),
})

export type RecordCustomTransaction = typeof RecordCustomTransactionSchema.Type
