import { pipe, Schema } from 'effect'

import { FinancialEventIdentifiersSchema } from '@schemas/common/financialEventIdentifiers'
import { BaseLedgerEntrySourceSchema } from '@schemas/generalLedger/ledgerEntrySources/base'

export const CustomerRefundAllocationLedgerEntrySourceSchema = Schema.extend(
  BaseLedgerEntrySourceSchema,
  Schema.Struct({
    type: Schema.Literal('Refund_Allocation_Ledger_Entry_Source'),
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
  }),
)
