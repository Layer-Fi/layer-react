import { BankTransaction, Direction } from './bank_transactions'

export type LedgerAccounts = LedgerAccountsLine[]

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
}

export interface LedgerAccountsLine {
  type: string
  id: string
  entry_id: string
  account: LedgerAccountsAccount
  amount: number
  direction: Direction
  date: string
  transaction?: BankTransaction
  invoice: string | null
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
  account?: LedgerAccountsAccount
  amount: number
  createdAt: string
  direction: Direction
  entry_at: string
  entry_id: string
  id: string
}
