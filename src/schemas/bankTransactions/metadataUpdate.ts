import { pipe, Schema } from 'effect'

/** PUT metadata body - updates the transaction's memo. */
export const BankTransactionMemoUpdateSchema = Schema.Struct({
  memo: Schema.String,
})

export type BankTransactionMemoUpdate = typeof BankTransactionMemoUpdateSchema.Type
export type BankTransactionMemoUpdateEncoded = typeof BankTransactionMemoUpdateSchema.Encoded

/** PATCH metadata body - assigns the transaction's customer/vendor by id. */
export const BankTransactionCounterpartyUpdateSchema = Schema.Struct({
  customerId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('customer_id'),
  ),
  vendorId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_id'),
  ),
})

export type BankTransactionCounterpartyUpdate = typeof BankTransactionCounterpartyUpdateSchema.Type
export type BankTransactionCounterpartyUpdateEncoded = typeof BankTransactionCounterpartyUpdateSchema.Encoded
