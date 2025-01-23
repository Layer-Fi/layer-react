import { TransactionTag } from './tags'
import { Vendor } from './vendors'

export type BillStatus = 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'VOIDED'

export type BillStatusFilter = 'PAID' | 'UNPAID'

export const UnpaidStatuses = ['SENT', 'PARTIALLY_PAID']
export const PaidStatuses = ['PAID']

export const BillTerms = [{
  id: 'due_on_receipt',
  label: 'Due on receipt',
}, {
  id: 'net_10',
  label: 'Net 10',
}, {
  id: 'net_15',
  label: 'Net 15',
}, {
  id: 'net_30',
  label: 'Net 30',
}, {
  id: 'net_60',
  label: 'Net 60',
}]

export type PaymentAllocationMethod =
  | 'CASH'
  | 'CHECK'
  | 'CREDIT_CARD'
  | 'ACH'
  | 'REDEEMED_PREPAYMENT'
  | 'OTHER'

export type Bill = {
  id: string
  type: 'Bill'
  business_id: string
  external_id: string
  status: BillStatus
  received_at: string
  due_at: string
  paid_at?: string
  voided_at?: string
  bill_number: string
  line_items: BillLineItem[]
  subtotal: number
  total_amount: number
  outstanding_balance: number
  payment_allocations: BillPayment[]
  imported_at: string
  updated_at: string
  transaction_tags: TransactionTag[]
  vendor?: Vendor
}

export type BillLineItem = {
  id: string
  external_id: string
  bill_id: string
  account_identifier: string
  description: string
  product: string
  unit_price: number
  quantity: number
  subtotal: number
  total_amount: number
}

export type BillPayment = {
  id: string
  external_id: string
  at: string
  method: PaymentAllocationMethod
  fee: number
  additional_fees: AdditionalFee[]
  amount: number
  processor?: string
  imported_at: string
  transaction_tags: TransactionTag[]
}

export type AdditionalFee = {
  fee_amount: number
  description: string
  account: string
}
