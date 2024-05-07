import { useState } from 'react'
import { Layer } from '../../api/layer'
import {
  JournalEntry,
  JournalEntryLine,
  NewJournalEntry,
} from '../../types/journal'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseJournal = () => {
  data?: JournalEntry[]
  entryData?: JournalEntryLine
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
  create: (newJournalEntry: NewJournalEntry) => void
  submitForm: () => void
  cancelForm: () => void
  sendingForm: boolean
  form?: JournalFormTypes
  apiError?: string
  setForm: (form?: JournalFormTypes) => void
}

export interface JournalFormTypes {
  action: 'new'
  data: {}

export const useJournal: UseJournal = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const [form, setForm] = useState<JournalFormTypes | undefined>()
  const [sendingForm, setSendingForm] = useState(false)
  const [apiError, setApiError] = useState<string | undefined>(undefined)

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    businessId && auth?.access_token && `journal-lines-${businessId}`,
    Layer.getJournal(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

  const refetch = () => mutate()

  const closeSelectedEntry = () => {
    setSelectedEntryId(undefined)
  }

  const create = async (newJournalEntry: NewJournalEntry) => {
    setSendingForm(true)
    setApiError(undefined)

    try {
      await Layer.createJournalEntries(apiUrl, auth?.access_token, {
        params: { businessId },
        body: newJournalEntry,
      })
      await refetch()
      setForm(undefined)
    } catch (_err) {
      setApiError('Submit failed. Please, check your connection and try again.')
    } finally {
      setSendingForm(false)
    }
  }

  const submitForm = () => {
    if (form?.action === 'new') {
      create(form.data as NewJournalEntry)
    }
  }

  return {
    data: data?.data,
    isLoading,
    isValidating,
    error,
    refetch,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
    create,
    submitForm,
    cancelForm: () => {
      setForm(undefined), setSelectedEntryId(undefined)
    },
    setForm,
    sendingForm,
    form,
    apiError,
  }
}

export const flattenEntries = (entries: JournalEntry[]): JournalEntry[] =>
  entries
    .flatMap(a => [a, flattenEntries(a.line_items || [])])
    .flat()
    .filter(id => id)
