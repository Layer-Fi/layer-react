import { pipe, Schema } from 'effect'

import { CustomerSchema } from '@schemas/customer'
import { LedgerEntryDirectionSchema, SingleChartAccountSchema } from '@schemas/generalLedger/ledgerAccount'
import { TransactionTagSchema } from '@schemas/tag'
import { VendorSchema } from '@schemas/vendor'

export enum ClassifierAgent {
  Sms = 'SMS',
  Api = 'API',
  LayerAuto = 'LAYER_AUTO',
  LayerManual = 'LAYER_MANUAL',
  QuickbooksSync = 'QUICKBOOKS_SYNC',
  CheckPayrollSync = 'CHECK_PAYROLL_SYNC',
}
const ClassifierAgentSchema = Schema.Enums(ClassifierAgent)

export enum EntryType {
  Expense = 'EXPENSE',
  Revenue = 'REVENUE',
  OpeningBalance = 'OPENING_BALANCE',
  Invoice = 'INVOICE',
  InvoicePayment = 'INVOICE_PAYMENT',
  InvoiceWriteOff = 'INVOICE_WRITE_OFF',
  RefundAllocation = 'REFUND_ALLOCATION',
  RefundPayment = 'REFUND_PAYMENT',
  VendorRefundAllocation = 'VENDOR_REFUND_ALLOCATION',
  VendorRefundPayment = 'VENDOR_REFUND_PAYMENT',
  Manual = 'MANUAL',
  Reversal = 'REVERSAL',
  Payout = 'PAYOUT',
  VendorPayout = 'VENDOR_PAYOUT',
  Payroll = 'PAYROLL',
  PayrollPayment = 'PAYROLL_PAYMENT',
  Match = 'MATCH',
  Quickbooks = 'QUICKBOOKS',
  Bill = 'BILL',
  BillPayment = 'BILL_PAYMENT',
  VendorCredit = 'VENDOR_CREDIT',
  CustomerCredit = 'CUSTOMER_CREDIT',
}
const EntryTypeSchema = Schema.Enums(EntryType)

export const LedgerEntryLineItemSchema = Schema.Struct({
  id: Schema.UUID,
  entryId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('entry_id'),
  ),
  account: SingleChartAccountSchema,
  amount: Schema.Number,
  direction: LedgerEntryDirectionSchema,
  customer: Schema.NullishOr(CustomerSchema),
  vendor: Schema.NullishOr(VendorSchema),
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('createdAt'),
  ),
  entryReversalOf: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('entry_reversal_of'),
  ),
  entryReversedBy: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('entry_reversed_by'),
  ),
})

export const LedgerEntrySchema = Schema.Struct({
  id: Schema.UUID,
  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),
  ledgerId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('ledger_id'),
  ),
  entryNumber: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('entry_number'),
  ),
  agent: Schema.NullishOr(ClassifierAgentSchema),
  entryType: pipe(
    Schema.propertySignature(Schema.NullishOr(EntryTypeSchema)),
    Schema.fromKey('entry_type'),
  ),
  customer: Schema.NullishOr(CustomerSchema),
  vendor: Schema.NullishOr(VendorSchema),
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('date'),
  ),
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  reversalOfId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('reversal_of_id'),
  ),
  reversalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('reversal_id'),
  ),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(LedgerEntryLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
  source: Schema.Unknown,
  transactionTags: pipe(
    Schema.propertySignature(Schema.Array(TransactionTagSchema)),
    Schema.fromKey('transaction_tags'),
  ),
  memo: Schema.NullishOr(Schema.String),
  metadata: Schema.NullishOr(Schema.Unknown),
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export type LedgerEntry = typeof LedgerEntrySchema.Type

export const LedgerAccountLineItemSchema = Schema.Struct({
  id: Schema.String,
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  entryNumber: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('entry_number'),
  ),
  account: SingleChartAccountSchema,
  amount: Schema.Number,
  direction: LedgerEntryDirectionSchema,
  date: Schema.Date,
  source: Schema.Unknown,
  entryReversalOf: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('entry_reversal_of'),
  ),
  entryReversedBy: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('entry_reversed_by'),
  ),
  isReversed: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('is_reversed'),
  ),
  runningBalance: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('running_balance'),
  ),
  tags: Schema.Array(TransactionTagSchema),
})

export type LedgerAccountLineItem = typeof LedgerAccountLineItemSchema.Type
