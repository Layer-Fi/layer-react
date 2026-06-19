import { pipe, Schema } from 'effect'

import { TransformedCategorizationStatusSchema } from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirectionSchema } from '@schemas/bankTransactions/base'

export const BankTransactionDataOnlySchema = Schema.Struct({
  id: Schema.UUID,
  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),
  source: Schema.String,
  sourceTransactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('source_transaction_id'),
  ),
  sourceAccountId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('source_account_id'),
  ),
  importedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('imported_at'),
  ),
  date: Schema.Date,
  direction: BankTransactionDirectionSchema,
  amount: Schema.Number,
  counterpartyName: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('counterparty_name'),
  ),
  description: Schema.NullishOr(Schema.String),
  accountName: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('account_name'),
  ),
  categorizationStatus: pipe(
    Schema.propertySignature(TransformedCategorizationStatusSchema),
    Schema.fromKey('categorization_status'),
  ),
  metadata: Schema.NullishOr(Schema.Unknown),
  memo: Schema.NullishOr(Schema.String),
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
  customerId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('customer_id'),
  ),
  vendorId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('vendor_id'),
  ),
  counterpartyId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('counterparty_id'),
  ),
  taxCode: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('tax_code'),
  ),
})

export type BankTransactionDataOnly = typeof BankTransactionDataOnlySchema.Type
export type BankTransactionDataOnlyEncoded = typeof BankTransactionDataOnlySchema.Encoded
