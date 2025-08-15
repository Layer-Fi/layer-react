import { LedgerEntrySourceType } from '../schemas/ledgerEntrySourceSchemas'
import { Account } from '../types'
import { Direction } from './bank_transactions'
import { AccountIdentifierPayloadObject } from './categories'
import type { TransactionTag } from './tags'

export interface JournalEntry {
  id: string
  business_id: string
  ledger_id: string
  entry_type: string
  entry_number: number
  date: string
  entry_at: string
  reversal_of_id: string | null
  reversal_id: string | null
  line_items: JournalEntryLine[]
  source?: LedgerEntrySourceType
  transaction_tags: ReadonlyArray<TransactionTag>
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

export type NewApiJournalEntry = {
  entry_at: string
  created_by: string
  memo: string
  line_items: NewApiJournalEntryLineItem[]
}

export type NewApiJournalEntryLineItem = {
  account_identifier: AccountIdentifierPayloadObject
  amount: number
  direction: Direction
}

export type NewFormJournalEntry = {
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
