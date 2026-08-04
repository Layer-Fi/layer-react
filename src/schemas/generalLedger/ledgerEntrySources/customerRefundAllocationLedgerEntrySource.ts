import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
export const CustomerRefundAllocationLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Refund_Allocation_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  refundId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_id'),
  ),
  amount: Schema.Number,
  recipientName: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('recipient_name'),
  ),
  customerDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('customer_description'),
  ),
  customerRefundIdentifiers: pipe(
    Schema.propertySignature(FinancialEventIdentifiersSchema),
    Schema.fromKey('customer_refund_identifiers'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})
