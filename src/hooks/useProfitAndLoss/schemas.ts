import { Schema, pipe } from 'effect'
import { Direction } from '../../types'

const TransactionLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Transaction_Ledger_Entry_Source'),
  transactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('transaction_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  accountName: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('account_name'),
  ),
  date: Schema.String,
  amount: Schema.Number,
  direction: Schema.Enums(Direction),
  counterparty: Schema.optional(Schema.String),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const InvoiceLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Invoice_Ledger_Entry_Source'),
  invoiceId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('invoice_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  invoiceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('invoice_number'),
  ),
  recipientName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('recipient_name'),
  ),
  customerDescription: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('customer_description'),
  ),
  date: Schema.String,
  amount: Schema.Number,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const ManualLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Manual_Ledger_Entry_Source'),
  manualEntryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('manual_entry_id'),
  ),
  memo: Schema.NullOr(Schema.String),
  createdBy: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('created_by'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const InvoicePaymentLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Invoice_Payment_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  invoiceId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('invoice_id'),
  ),
  invoiceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('invoice_number'),
  ),
  amount: Schema.Number,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const RefundLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Refund_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  refundId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_id'),
  ),
  refundedToCustomerAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('refunded_to_customer_amount'),
  ),
  recipientName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('recipient_name'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const RefundPaymentLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Refund_Payment_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  refundId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_id'),
  ),
  refundPaymentId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_payment_id'),
  ),
  refundedToCustomerAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('refunded_to_customer_amount'),
  ),
  recipientName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('recipient_name'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const OpeningBalanceLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Opening_Balance_Ledger_Entry_Source'),
  accountName: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('account_name'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const PayoutLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Payout_Ledger_Entry_Source'),
  payoutId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('payout_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  paidOutAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('paid_out_amount'),
  ),
  processor: Schema.String,
  completedAt: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('completed_at'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const LedgerEntrySourceSchema = Schema.Union(
  TransactionLedgerEntrySourceSchema,
  InvoiceLedgerEntrySourceSchema,
  ManualLedgerEntrySourceSchema,
  InvoicePaymentLedgerEntrySourceSchema,
  RefundLedgerEntrySourceSchema,
  RefundPaymentLedgerEntrySourceSchema,
  OpeningBalanceLedgerEntrySourceSchema,
  PayoutLedgerEntrySourceSchema,
)

const AccountTypeSchema = Schema.Struct({
  value: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

const AccountSubtypeSchema = Schema.Struct({
  value: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

export const AccountSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('stable_name'),
  ),
  normality: Schema.String,
  accountType: pipe(
    Schema.propertySignature(AccountTypeSchema),
    Schema.fromKey('account_type'),
  ),
  accountSubtype: pipe(
    Schema.propertySignature(AccountSubtypeSchema),
    Schema.fromKey('account_subtype'),
  ),
})

const TagFilterSchema = Schema.Struct({
  key: Schema.String,
  values: Schema.Array(Schema.String),
})

export const PnlDetailLineSchema = Schema.Struct({
  id: Schema.String,
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  account: AccountSchema,
  amount: Schema.Number,
  direction: Schema.Enums(Direction),
  date: Schema.String,
  source: Schema.optional(LedgerEntrySourceSchema),
})

export const PnlDetailLinesDataSchema = Schema.Struct({
  type: Schema.String,
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  startDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('start_date'),
  ),
  endDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('end_date'),
  ),
  pnlStructureLineItemName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('pnl_structure_line_item_name'),
  ),
  reportingBasis: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reporting_basis'),
  ),
  pnlStructure: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('pnl_structure'),
  ),
  tagFilter: pipe(
    Schema.propertySignature(Schema.NullOr(TagFilterSchema)),
    Schema.fromKey('tag_filter'),
  ),
  lines: Schema.Array(PnlDetailLineSchema),
})
