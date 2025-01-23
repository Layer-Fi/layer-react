import { LedgerAccountLineItem, LedgerAccountsEntry } from '../types'
import { AccountIdentifierPayloadObject } from '../types/categories'
import { JournalEntry, JournalEntryLineItem } from '../types/journal'

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
  entry: JournalEntry | LedgerAccountsEntry | LedgerAccountLineItem,
): string => {
  return entry.entry_number?.toString() ?? entry.id.substring(0, 5)
}
