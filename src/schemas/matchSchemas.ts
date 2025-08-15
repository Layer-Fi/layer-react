import { Schema, pipe } from 'effect'

export const ApiMatchAdjustmentSchema = Schema.Struct({
  amount: Schema.Number,
  account: Schema.Struct({
    id: Schema.String,
    type: Schema.optional(Schema.String),
  }),
  description: Schema.String,
})

export const FinancialEventIdentifiersSchema = Schema.Struct({
  id: Schema.String,
  externalId: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('external_id'),
  ),
  referenceNumber: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('reference_number'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
})

const BaseMatchDetailsSchema = Schema.Struct({
  id: Schema.String,
  externalId: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('external_id'),
  ),
  amount: Schema.Number,
  date: Schema.String,
  description: Schema.String,
  adjustment: Schema.optional(ApiMatchAdjustmentSchema),
  referenceNumber: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('reference_number'),
  ),
  metadata: Schema.optional(Schema.Unknown),
})

export const ManualJournalEntryMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Journal_Entry_Match'),
  }),
)

export const RefundPaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Refund_Payment_Match'),
    customerRefundIdentifiers: pipe(
      Schema.propertySignature(FinancialEventIdentifiersSchema),
      Schema.fromKey('customer_refund_identifiers'),
    ),
  }),
)

export const VendorRefundPaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Vendor_Refund_Payment_Match'),
    vendorRefundIdentifiers: pipe(
      Schema.propertySignature(FinancialEventIdentifiersSchema),
      Schema.fromKey('vendor_refund_identifiers'),
    ),
  }),
)

export const InvoicePaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Invoice_Match'),
    invoiceIdentifiers: pipe(
      Schema.propertySignature(Schema.Array(FinancialEventIdentifiersSchema)),
      Schema.fromKey('invoice_identifiers'),
    ),
  }),
)

export const PayoutMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Payout_Match'),
  }),
)

export const VendorPayoutMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Vendor_Payout_Match'),
  }),
)

export const BillPaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Bill_Match'),
    billIdentifiers: pipe(
      Schema.propertySignature(Schema.Array(FinancialEventIdentifiersSchema)),
      Schema.fromKey('bill_identifiers'),
    ),
  }),
)

export const PayrollPaymentMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Payroll_Match'),
  }),
)

export const TransferMatchDetailsSchema = Schema.extend(
  BaseMatchDetailsSchema,
  Schema.Struct({
    type: Schema.Literal('Transfer_Match'),
    fromAccountName: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('from_account_name'),
    ),
    toAccountName: pipe(
      Schema.propertySignature(Schema.String),
      Schema.fromKey('to_account_name'),
    ),
  }),
)

export const MatchDetailsSchema = Schema.Union(
  ManualJournalEntryMatchDetailsSchema,
  RefundPaymentMatchDetailsSchema,
  VendorRefundPaymentMatchDetailsSchema,
  InvoicePaymentMatchDetailsSchema,
  PayoutMatchDetailsSchema,
  VendorPayoutMatchDetailsSchema,
  BillPaymentMatchDetailsSchema,
  PayrollPaymentMatchDetailsSchema,
  TransferMatchDetailsSchema,
)

export const SuggestedMatchWithTransactionSchema = Schema.Struct({
  transactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('transaction_id'),
  ),
  suggestedMatchId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('suggested_match_id'),
  ),
})

export const SuggestedMatchesWithTransactionsSchema = Schema.Struct({
  matchPairs: pipe(
    Schema.propertySignature(Schema.Array(SuggestedMatchWithTransactionSchema)),
    Schema.fromKey('match_pairs'),
  ),
})

export const decodeMatchDetails = Schema.decodeUnknownSync(MatchDetailsSchema)
export type MatchDetailsType = typeof MatchDetailsSchema.Type
export type ApiMatchAdjustmentType = typeof ApiMatchAdjustmentSchema.Type
export type FinancialEventIdentifiersType = typeof FinancialEventIdentifiersSchema.Type
