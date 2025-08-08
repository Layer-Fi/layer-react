interface ApiMatchAdjustment {
  amount: number
  account: {
    id: string
    type?: string
  }
  description: string
}

interface FinancialEventIdentifiers {
  id: string
  external_id?: string
  reference_number?: string
  metadata?: Record<string, unknown>
}

interface BaseApiMatchDetails<TMetadata = unknown> {
  id: string
  external_id?: string
  amount: number
  date: string
  description: string
  adjustment?: ApiMatchAdjustment
  reference_number?: string
  metadata?: TMetadata
}

export interface ManualJournalEntryMatchDetails<TMetadata = unknown> extends BaseApiMatchDetails<TMetadata> {
  type: 'Journal_Entry_Match'
}

export interface RefundPaymentMatchDetails<TMetadata = unknown> extends BaseApiMatchDetails<TMetadata> {
  type: 'Refund_Payment_Match'
  customer_refund_identifiers: FinancialEventIdentifiers
}

export interface VendorRefundPaymentMatchDetails<TMetadata = unknown> extends BaseApiMatchDetails<TMetadata> {
  type: 'Vendor_Refund_Payment_Match'
  vendor_refund_identifiers: FinancialEventIdentifiers
}

export interface InvoicePaymentMatchDetails<TMetadata = unknown> extends BaseApiMatchDetails<TMetadata> {
  type: 'Invoice_Match'
  invoice_identifiers: FinancialEventIdentifiers[]
}

export interface PayoutMatchDetails<TMetadata = unknown> extends BaseApiMatchDetails<TMetadata> {
  type: 'Payout_Match'
}

export interface VendorPayoutMatchDetails<TMetadata = unknown> extends BaseApiMatchDetails<TMetadata> {
  type: 'Vendor_Payout_Match'
}

export interface BillPaymentMatchDetails<TMetadata = unknown> extends BaseApiMatchDetails<TMetadata> {
  type: 'Bill_Match'
  bill_identifiers: FinancialEventIdentifiers[]
}

export interface PayrollPaymentMatchDetails<TMetadata = unknown> extends BaseApiMatchDetails<TMetadata> {
  type: 'Payroll_Match'
}

export interface TransferMatchDetails<TMetadata = unknown> extends BaseApiMatchDetails<TMetadata> {
  type: 'Transfer_Match'
  from_account_name: string
  to_account_name: string
}

export type ApiMatchDetails<TMetadata = unknown> =
  | ManualJournalEntryMatchDetails<TMetadata>
  | RefundPaymentMatchDetails<TMetadata>
  | VendorRefundPaymentMatchDetails<TMetadata>
  | InvoicePaymentMatchDetails<TMetadata>
  | PayoutMatchDetails<TMetadata>
  | VendorPayoutMatchDetails<TMetadata>
  | BillPaymentMatchDetails<TMetadata>
  | PayrollPaymentMatchDetails<TMetadata>
  | TransferMatchDetails<TMetadata>

export interface SuggestedMatchWithTransaction {
  transaction_id: string
  suggested_match_id: string
}

export interface SuggestedMatchesWithTransactions {
  match_pairs: SuggestedMatchWithTransaction[]
}
