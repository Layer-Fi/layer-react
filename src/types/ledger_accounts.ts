import { BankTransaction, Direction } from './bank_transactions'

export type LedgerAccountLineItems = LedgerAccountLineItem[]

export interface LedgerAccountsEntry {
  agent?: string
  business_id: string
  date: string
  entry_at: string
  entry_type: string // @TODO - into enum?
  id: string
  invoice?: Record<string, string> // @TODO - fix after having API ready
  ledger_id: string
  line_items: LedgerAccountLineItem[]
  manual_entry?: boolean // @TODO - is it correct
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
  account: LedgerAccountsAccount
  amount: number
  direction: Direction
  date: string
  source?: LedgerEntrySource
  running_balance: number
}

export interface LedgerEntrySource {
  display_description: string
  entity_name: string
  type: string
}
export interface TransactionLedgerEntrySource extends LedgerEntrySource {
  transaction_id: string
  external_id: string
  account_name: string
  date: string
  amount: number
  direction: Direction
  counterparty?: string
}

export interface InvoiceLedgerEntrySource extends LedgerEntrySource {
  invoice_id: string
  external_id: string
  invoice_number: string
  recipient_name: string
  date: string
  amount: number
}

export interface ManualLedgerEntrySource extends LedgerEntrySource {
  manual_entry_id: string
  memo: string
  created_by: string
}

export interface InvoicePaymentLedgerEntrySource extends LedgerEntrySource {
  external_id: string
  invoice_id: string
  invoice_number: string
  amount: number
}

export interface RefundPaymentLedgerEntrySource extends LedgerEntrySource {
  external_id: string
  refund_id: string
  refunded_to_customer_amount: number
  recipient_name: string
}

export interface OpeningBalanceLedgerEntrySource extends LedgerEntrySource {
  account_name: string
}

export interface PayoutLedgerEntrySource extends LedgerEntrySource {
  payout_id: string
  external_id: string
  paid_out_amount: number
  processor: string
  completed_at: string
}
