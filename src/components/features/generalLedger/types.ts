import { type LedgerEntrySourceDetailStringOverrides } from '@blocks/LedgerEntry/LedgerEntrySourceDetailView/LedgerEntrySourceDetailView'

export interface JournalEntryDetailStringOverrides {
  entryTypeLabel?: string
  dateLabel?: string
  creationDateLabel?: string
  reversalLabel?: string
}

export interface LedgerEntryDetailsLineItemsTableStringOverrides {
  lineItemsColumnHeader?: string
  debitColumnHeader?: string
  creditColumnHeader?: string
  totalRowHeader?: string
}

export interface LedgerEntryDetailStringOverrides {
  title?: string
  transactionSource?: {
    header?: string
    details?: LedgerEntrySourceDetailStringOverrides
  }
  journalEntry?: {
    header?: (entryId?: string) => string
    details?: JournalEntryDetailStringOverrides
  }
  lineItemsTable?: LedgerEntryDetailsLineItemsTableStringOverrides
}
