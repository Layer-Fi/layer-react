import { Account } from '../types'
import { Direction } from './bank_transactions'

export interface JournalEntry {
  id: string
  business_id: string
  ledger_id: string
  agent: string
  entry_type: string
  date: string
  entry_at: string
  reversal_of_id: string | null
  reversal_id: string | null
  line_items: any[]
}

export interface JournalEntryLine {
  id: string
  entry_id: string
  account: Account
  amount: number
  direction: Direction
  entry_at: string
  createdAt: string
}

export type NewJournalEntry = {
  entry_at: string
  created_by: string
  memo: string
  line_items: {
    account_identifier: {
      type: string
      stable_name: string
    }
    amount: number
    direction: Direction
  }[]
}
