import { BankTransaction, Direction } from './bank_transactions'

export type LedgerAccountLineItems = LedgerAccountLineItem[]

export interface LedgerAccountsEntry {
  business_id: string
  date: string
  entry_at: string
  entry_number?: number
  entry_type: string // @TODO - into enum?
  id: string
  invoice?: Record<string, string> // @TODO - fix after having API ready
  ledger_id: string
  line_items: LedgerAccountLineItem[]
  reversal_id?: string
  reversal_of_id?: string
  type: string
  transaction?: BankTransaction
  source?: LedgerEntrySource
}

export interface LedgerAccountsAccount {
  always_show_in_pnl?: boolean
  id: string
  name: string
  normality: string // @TODO - enum?
  pnl_category?: string
  stable_name: string
}

export interface LedgerAccountLineItem {
  id: string
  entry_id: string
  entry_number?: number
  account: LedgerAccountsAccount
  amount: number
  direction: Direction
  date: string
  source?: LedgerEntrySource
  running_balance: number
  entry_reversal_of?: string
  entry_reversed_by?: string
}

export interface FinancialEventIdentifiers {
  id: string
  external_id?: string
  reference_number?: string
  metadata?: Record<string, unknown>
}

export interface ApiVendorData {
  vendor_external_id?: string
  vendor_description: string
}

export interface ApiCustomerData {
  customer_description: string
  recipient_name?: string
}

export interface LedgerEntrySource<TMetadata = unknown> {
  type: string
  external_id?: string
  display_description: string
  entity_name: string
  memo?: string
  metadata?: TMetadata
  reference_number?: string
}
export interface TransactionLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Transaction_Ledger_Entry_Source'
  transaction_id: string
  external_id: string
  account_name: string
  date: string
  amount: number
  direction: Direction
  counterparty?: string
  description?: string
}

export interface InvoiceLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Invoice_Ledger_Entry_Source'
  invoice_id: string
  invoice_number?: string
  customer_description: string
  recipient_name?: string
  date: string
  amount: number
}

export interface InvoiceWriteOffLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Invoice_Write_Off_Ledger_Entry_Source'
  invoice_id: string
  invoice_number?: string
  recipient_name?: string
  customer_description: string
  date: string
  write_off_amount: number
  invoice_identifiers: FinancialEventIdentifiers
}

export interface ManualLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Manual_Ledger_Entry_Source'
  manual_entry_id: string
  created_by: string
}

export interface InvoicePaymentLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Invoice_Payment_Ledger_Entry_Source'
  invoice_id: string
  invoice_number?: string
  amount: number
  invoice_identifiers: FinancialEventIdentifiers[]
}

export interface CustomerRefundAllocationLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Refund_Allocation_Ledger_Entry_Source'
  refund_id: string
  amount: number
  recipient_name?: string
  customer_description: string
  customer_refund_identifiers: FinancialEventIdentifiers
}

export interface CustomerRefundPaymentLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Refund_Payment_Ledger_Entry_Source'
  refund_id: string
  refund_payment_id: string
  refunded_to_customer_amount: number
  recipient_name?: string
  customer_description: string
  customer_refund_identifiers: FinancialEventIdentifiers
}

export interface VendorRefundAllocationLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Vendor_Refund_Allocation_Ledger_Entry_Source'
  refund_id: string
  amount: number
  vendor_external_id?: string
  vendor_description: string
  vendor_refund_identifiers: FinancialEventIdentifiers
}

export interface VendorRefundPaymentLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Vendor_Refund_Payment_Ledger_Entry_Source'
  refund_id: string
  refund_payment_id: string
  refunded_by_vendor_amount: number
  vendor_external_id?: string
  vendor_description: string
  vendor_refund_identifiers: FinancialEventIdentifiers
}

export interface OpeningBalanceLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Opening_Balance_Ledger_Entry_Source'
  account_name: string
  opening_balance_id: string
}

export interface CustomerPayoutLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Payout_Ledger_Entry_Source'
  payout_id: string
  paid_out_amount: number
  processor?: string
  completed_at: string
}

export interface VendorPayoutLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Vendor_Payout_Ledger_Entry_Source'
  vendor_payout_id: string
  paid_out_amount: number
  processor?: string
  completed_at: string
}

export interface PayrollLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Payroll_Ledger_Entry_Source'
  payroll_id: string
  payday: string
}

export interface PayrollPaymentLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Payroll_Payment_Ledger_Entry_Source'
  payroll_id: string
  amount: number
}

export interface QuickbooksLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Quickbooks_Ledger_Entry_Source'
  quickbooks_id?: string
  import_date: string
}

export interface BillLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Bill_Ledger_Entry_Source'
  bill_id: string
  bill_number?: string
  vendor_description: string
  vendor_external_id?: string
  date: string
  amount: number
}

export interface BillPaymentLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Bill_Payment_Ledger_Entry_Source'
  bill_id: string
  bill_number?: string
  amount: number
  bill_identifiers: FinancialEventIdentifiers[]
}

export interface VendorCreditLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Vendor_Credit_Ledger_Entry_Source'
  vendor_credit_id: string
  amount: number
  vendor: ApiVendorData
}

export interface CustomerCreditLedgerEntrySource<TMetadata = unknown> extends LedgerEntrySource<TMetadata> {
  type: 'Customer_Credit_Ledger_Entry_Source'
  customer_credit_id: string
  amount: number
  customer: ApiCustomerData
}
