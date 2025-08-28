import { LedgerEntrySourceType } from '../schemas/generalLedger/ledgerEntrySource'
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
  source?: LedgerEntrySourceType
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
  source?: LedgerEntrySourceType
  running_balance: number
  entry_reversal_of?: string
  entry_reversed_by?: string
}
