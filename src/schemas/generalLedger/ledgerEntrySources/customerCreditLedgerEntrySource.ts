import { pipe, Schema } from 'effect'

import { CustomerSchema } from '@schemas/customerVendor/customer'
export const CustomerCreditLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Customer_Credit_Ledger_Entry_Source'),
  customerCreditId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('customer_credit_id'),
  ),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  customer: CustomerSchema,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
