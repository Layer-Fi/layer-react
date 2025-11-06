import { LedgerAccountLineItem, LedgerAccountsEntry } from '@internal-types/ledger_accounts'
import { AccountIdentifierPayloadObject } from '@internal-types/categories'
import { JournalEntry, JournalEntryLineItem } from '@internal-types/journal'

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
