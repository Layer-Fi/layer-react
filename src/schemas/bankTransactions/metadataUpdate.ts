import { pipe, Schema } from 'effect'

/**
 * PATCH metadata body - a partial update. Any omitted field is left untouched
 * server-side, so a memo-only update never clears the counterparty, and vice versa.
 */
export const BankTransactionMetadataUpdateSchema = Schema.Struct({
  memo: Schema.optional(Schema.String),
  customerId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('customer_id'),
  ),
  vendorId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_id'),
  ),
})

export type BankTransactionMetadataUpdate = typeof BankTransactionMetadataUpdateSchema.Type
export type BankTransactionMetadataUpdateEncoded = typeof BankTransactionMetadataUpdateSchema.Encoded
