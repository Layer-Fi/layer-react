import { type AccountIdentifierPayloadObject } from '@internal-types/categories'
import { type LedgerEntryDirection, type SingleChartAccountEncodedType } from '@schemas/generalLedger/ledgerAccount'
import { type LedgerEntrySourceType } from '@schemas/generalLedger/ledgerEntrySource'
import type { Tag, TransactionTagEncoded } from '@features/tags/tagSchemas'

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
  transaction_tags: ReadonlyArray<TransactionTagEncoded>
}

export interface JournalEntryLine {
  id: string
  entry_id: string
  account: SingleChartAccountEncodedType
  amount: number
  direction: LedgerEntryDirection
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
  direction: LedgerEntryDirection
  job?: Tag | null
  description?: string
}

export type NewFormJournalEntry = {
  entry_at: string
  created_by: string
  memo: string
  line_items: JournalEntryLineItem[]
  notes?: string
}

export type JournalEntryLineItem = {
  account_identifier: {
    type: string
    stable_name: string | null
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
  direction: LedgerEntryDirection
  job?: Tag | null
  description?: string
}

export type ApiAccountType = {
  value: string
  display_name: string
}

export type LedgerAccountBalance = {
  id: string
  name: string
  stable_name: string
  account_number: string | null
  account_type: ApiAccountType
  account_subtype?: ApiAccountType
  normality: LedgerEntryDirection
  balance: number
  is_deletable: boolean
  sub_accounts: LedgerAccountBalance[]
}
