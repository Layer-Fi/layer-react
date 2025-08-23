import { Schema, pipe } from 'effect'
import { CustomerSchema } from '../customer'
import { VendorSchema } from '../vendor'
import { LedgerEntrySourceSchema } from './ledgerEntrySource'
import { LedgerAccountSchema, LedgerEntryDirectionSchema, NestedLedgerAccountSchema } from './ledgerAccount'

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

export const LedgerAccountLineItemSchema = Schema.Struct({
  id: Schema.String,
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  entryNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Number)),
    Schema.fromKey('entry_number'),
  ),
  account: LedgerAccountSchema,
  amount: Schema.Number,
  direction: LedgerEntryDirectionSchema,
  date: Schema.Date,
  source: LedgerEntrySourceSchema,
  entryReversalOf: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('entry_reversal_of'),
  ),
  entryReversedBy: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
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
})

export const LedgerEntryLineItemSchema = Schema.Struct({
  id: Schema.String,
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  account: LedgerAccountSchema,
  amount: Schema.Number,
  direction: LedgerEntryDirectionSchema,
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
})

export const LedgerEntrySchema = Schema.Struct({
  id: Schema.String,
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  ledgerId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('ledger_id'),
  ),
  agent: ClassifierAgentSchema,
  entryType: pipe(
    Schema.propertySignature(EntryTypeSchema),
    Schema.fromKey('entry_type'),
  ),
  entryNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Number)),
    Schema.fromKey('entry_number'),
  ),
  date: Schema.Date,
  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  reversalOfId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reversal_of_id'),
  ),
  reversalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reversal_id'),
  ),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(LedgerEntryLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
  source: LedgerEntrySourceSchema,
  memo: Schema.NullOr(Schema.String),
  metadata: Schema.NullOr(Schema.Unknown),
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const LedgerSchema = Schema.Struct({
  accounts: Schema.Array(NestedLedgerAccountSchema),
  enties: Schema.Array(LedgerEntrySchema),
})

export type LedgerAccountLineItem = typeof LedgerAccountLineItemSchema.Type
export type LedgerEntryLineItem = typeof LedgerEntryLineItemSchema.Type
export type LedgerEntry = typeof LedgerEntrySchema.Type
export type Ledger = typeof LedgerSchema.Type
