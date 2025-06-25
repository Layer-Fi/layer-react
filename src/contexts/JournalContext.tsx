import { createContext } from 'react'
import { JournalEntry, NewApiJournalEntry } from '../types/journal'
import { JournalFormTypes } from '../hooks/useJournal/useJournal'
import { BaseSelectOption } from '../types/general'
import { LedgerAccountBalance } from '../types/chart_of_accounts'
import { Direction } from '../types/bank_transactions'

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
  create: (newJournalEntry: NewApiJournalEntry) => void
  changeFormData: (
    name: string, 
    value: string | BaseSelectOption | undefined | number, 
    lineItemIndex?: number, 
    accounts?: LedgerAccountBalance[]
  ) => void
  submitForm: () => void
  cancelForm: () => void
  addEntry: () => void
  sendingForm: boolean
  form?: JournalFormTypes
  apiError?: string
  setForm: (form?: JournalFormTypes) => void
  addEntryLine: (direction: Direction) => void
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