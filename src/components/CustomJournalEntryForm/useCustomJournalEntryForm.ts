import { createCustomJournalEntry } from '../../api/layer/journalNew'

type UseCustomJournalEntryForm = () => {
  submit: () => void
}

export const useCustomJournalEntryForm: UseCustomJournalEntryForm = () => {
  const submit = () => {
    void createCustomJournalEntry()
  }
  return { submit }
}
