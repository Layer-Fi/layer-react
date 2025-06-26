import { createContext } from 'react'
import { useJournal } from '../../hooks/useJournal'

export type JournalContextType = ReturnType<typeof useJournal>
export const JournalContext = createContext<JournalContextType>({
  refetch: () => {},
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  create: () => {},
  changeFormData: () => {},
  submitForm: () => {},
  cancelForm: () => {},
  addEntry: () => {},
  sendingForm: false,
  setForm: () => {},
  addEntryLine: () => {},
  removeEntryLine: () => {},
  reverseEntry: () => Promise.resolve({}),
  hasMore: false,
  fetchMore: () => {},
})