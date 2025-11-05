import { createContext } from 'react'
import { useJournal } from '../../hooks/useJournal/useJournal'

export type JournalContextType = ReturnType<typeof useJournal>
export const JournalContext = createContext<JournalContextType>({
  refetch: () => Promise.resolve(undefined),
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  create: () => Promise.resolve(undefined),
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
