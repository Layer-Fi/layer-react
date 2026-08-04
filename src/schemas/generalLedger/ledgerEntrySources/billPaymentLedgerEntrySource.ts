import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
export const BillPaymentLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Bill_Payment_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  billPaymentId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('bill_payment_id'),
  ),
  billId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('bill_id'),
  ),
  billNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('bill_number'),
  ),
  amount: Schema.Number,
  billIdentifiers: pipe(
    Schema.propertySignature(Schema.Array(FinancialEventIdentifiersSchema)),
    Schema.fromKey('bill_identifiers'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
