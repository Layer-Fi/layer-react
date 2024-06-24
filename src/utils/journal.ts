import { AccountIdentifierPayloadObject } from '../types/categories'
import { JournalEntryLineItem } from '../types/journal'

export const getAccountIdentifierPayload = (
  journalLineItem: JournalEntryLineItem,
): AccountIdentifierPayloadObject => {
  if (journalLineItem.account_identifier.id) {
    return {
      type: 'AccountId',
      id: journalLineItem.account_identifier.id,
    }
  }
  if (journalLineItem.account_identifier.stable_name) {
    return {
      type: 'StableName',
      stable_name: journalLineItem.account_identifier.stable_name,
    }
  }

  throw new Error('Invalid account identifier')
}
