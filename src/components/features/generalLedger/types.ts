export interface SourceDetailStringOverrides {
  sourceLabel?: string
  accountNameLabel?: string
  dateLabel?: string
  amountLabel?: string
  directionLabel?: string
  counterpartyLabel?: string
  invoiceNumberLabel?: string
  recipientNameLabel?: string
  memoLabel?: string
  createdByLabel?: string
  processorLabel?: string
}

export interface JournalEntryDetailStringOverrides {
  entryTypeLabel?: string
  dateLabel?: string
  creationDateLabel?: string
  reversalLabel?: string
}

export interface LineItemsTableStringOverrides {
  lineItemsColumnHeader?: string
  debitColumnHeader?: string
  creditColumnHeader?: string
  totalRowHeader?: string
}

export interface LedgerEntryDetailStringOverrides {
  title?: string
  transactionSource?: {
    header?: string
    details?: SourceDetailStringOverrides
  }
  journalEntry?: {
    header?: (entryId?: string) => string
    details?: JournalEntryDetailStringOverrides
  }
  lineItemsTable?: LineItemsTableStringOverrides
}
