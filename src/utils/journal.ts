import { type AccountIdentifierPayloadObject } from '@internal-types/categories'
import { type JournalEntry, type JournalEntryLineItem } from '@internal-types/journal'
import { type LedgerAccountLineItem, type LedgerAccountsEntry } from '@internal-types/ledger_accounts'

export const getAccountIdentifierPayload = (
  journalLineItem: JournalEntryLineItem,
): AccountIdentifierPayloadObject => {
  if (journalLineItem.account_identifier.stable_name) {
    return {
      type: 'StableName',
      stable_name: journalLineItem.account_identifier.stable_name,
    }
  }

  if (journalLineItem.account_identifier.id) {
    return {
      type: 'AccountId',
      id: journalLineItem.account_identifier.id,
    }
  }

  throw new Error('Invalid account identifier')
}

export const entryNumber = (
  entry: JournalEntry | LedgerAccountsEntry,
): string => {
  return entry.entry_number?.toString() ?? entry.id.substring(0, 5)
}

export const lineEntryNumber = (
  ledgerEntryLine: LedgerAccountLineItem,
): string => {
  return ledgerEntryLine.entry_number?.toString() ?? ledgerEntryLine.entry_id.substring(0, 5)
}
