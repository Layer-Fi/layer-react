import { useState } from 'react'
import { Layer } from '../../api/layer'
import { Direction } from '../../types'
import { BaseSelectOption } from '../../types/general'
import { JournalEntry, NewJournalEntry } from '../../types/journal'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseJournal = () => {
  data?: JournalEntry[]
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
  changeFormData: (
    name: string,
    value: string | BaseSelectOption | undefined | number,
  ) => void
  submitForm: () => void
  cancelForm: () => void
  addEntry: () => void
  sendingForm: boolean
  form?: JournalFormTypes
  apiError?: string
  setForm: (form?: JournalFormTypes) => void
  addEntryLine: (direction: Direction) => void
}

export interface JournalFormTypes {
  action: 'new'
  data: NewJournalEntry
}

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

  const addEntry = () => {
    setSelectedEntryId('new')
    setForm({
      action: 'new',
      data: {
        entry_at: '2024-03-07T18:00:00Z',
        created_by: 'Test API Integration',
        memo: 'cash rent payment',
        line_items: [
          {
            account_identifier: {
              type: 'StableName',
              stable_name: 'JOB_SUPPLIES',
            },
            amount: 0,
            direction: Direction.DEBIT,
          },
          {
            account_identifier: {
              type: 'StableName',
              stable_name: 'CASH',
            },
            amount: 0,
            direction: Direction.CREDIT,
          },
        ],
      },
    })
  }

  const changeFormData = (
    fieldName: string,
    value: string | BaseSelectOption | undefined | number,
  ) => {
    if (!form) {
      return
    }

    let newFormData = {
      ...form,
      data: {
        ...form.data,
        [fieldName]: value,
      },
    }

    // const errors = revalidateField(fieldName, newFormData)

    setForm({
      ...newFormData,
      // errors,
    })
  }

  const submitForm = () => {
    console.log('submitForm', form)
    // if (form?.action === 'new') {
    //   create({} as NewJournalEntry)
    // }
  }

  const addEntryLine = (direction: Direction) => {
    if (!form) {
      return
    }

    const newEntryLine = {
      account_identifier: {
        type: '',
        stable_name: '',
      },
      amount: 0,
      direction,
    }

    const entryLines = form?.data.line_items || []
    entryLines.push(newEntryLine)

    setForm({
      ...form,
      data: {
        ...form.data,
        line_items: entryLines,
      },
    })
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
    addEntry,
    changeFormData,
    submitForm,
    cancelForm: () => {
      setForm(undefined), setSelectedEntryId(undefined)
    },
    setForm,
    sendingForm,
    form,
    apiError,
    addEntryLine,
  }
}

export const flattenEntries = (entries: JournalEntry[]): JournalEntry[] =>
  entries
    .flatMap(a => [a, flattenEntries(a.line_items || [])])
    .flat()
    .filter(id => id)
