import { createContext } from 'react'
import { useJournal } from '../../hooks/useJournal'

export type JournalContextType = ReturnType<typeof useJournal>
export const JournalContext = createContext<JournalContextType>({
  data: undefined,
  isLoading: false,
  isLoadingEntry: false,
  isValidating: false,
  isValidatingEntry: false,
  error: undefined,
  errorEntry: undefined,
  refetch: () => {},
  selectedEntryId: undefined,
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  addEntry: () => {},
  addEntryLine: () => {},
  removeEntryLine: () => {},
  create: () => {},
  changeFormData: () => {},
  submitForm: () => {},
  cancelForm: () => {},
  form: undefined,
  setForm: () => {},
  sendingForm: false,
  apiError: undefined,
  reverseEntry: () => Promise.resolve({}),
  hasMore: false,
  fetchMore: () => {},
})
