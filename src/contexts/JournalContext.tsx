import { createContext } from 'react'
import { JournalEntry } from '../types/journal'
import { JournalFormTypes } from '../hooks/useJournal/useJournal'

export interface JournalContextType {
  data?: ReadonlyArray<JournalEntry>
  isLoading?: boolean
  isLoadingEntry?: boolean
  isValidating?: boolean
  isValidatingEntry?: boolean
  error?: unknown
  errorEntry?: unknown
  refetch: () => void
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
  closeSelectedEntry: () => void
  create: (newJournalEntry: any) => void
  changeFormData: (name: string, value: any, lineItemIndex?: number, accounts?: any[]) => void
  submitForm: () => void
  cancelForm: () => void
  addEntry: () => void
  sendingForm: boolean
  form?: JournalFormTypes
  apiError?: string
  setForm: (form?: JournalFormTypes) => void
  addEntryLine: (direction: any) => void
  removeEntryLine: (index: number) => void
  reverseEntry: (entryId: string) => Promise<any>
  hasMore: boolean
  fetchMore: () => void
}

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
  reverseEntry: () => Promise.resolve(),
  hasMore: false,
  fetchMore: () => {},
})