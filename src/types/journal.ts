import { Account } from '../types'
import { Direction } from './bank_transactions'
import { LedgerEntrySource } from './ledger_accounts'

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
  line_items: JournalEntryLineItem[]
  source?: LedgerEntrySource
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
  line_items: JournalEntryLineItem[]
}

export type JournalEntryLineItem = {
  account_identifier: {
    type: string
    stable_name: string
    id: string
    name: string
    subType:
      | {
          value: string
          label: string
        }
      | undefined
  }
  amount: number
  direction: Direction
}
