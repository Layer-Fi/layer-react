import { useEffect, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { Direction, FormError, FormErrorWithId } from '../../types'
import { LedgerAccountBalance } from '../../types/chart_of_accounts'
import { BaseSelectOption, DataModel } from '../../types/general'
import {
  JournalEntry,
  JournalEntryLineItem,
  NewApiJournalEntry,
  NewFormJournalEntry,
} from '../../types/journal'
import { getAccountIdentifierPayload } from '../../utils/journal'
import { flattenAccounts } from '../useChartOfAccounts/useChartOfAccounts'
import useSWR from 'swr'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { APIError } from '../../models/APIError'
import { Awaitable } from '../../types/utility/promises'

type UseJournal = () => {
  data?: JournalEntry[]
  isLoading?: boolean
  isLoadingEntry?: boolean
  isValidating?: boolean
  isValidatingEntry?: boolean
  error?: unknown
  errorEntry?: unknown
  refetch: () => Awaitable<{ data: JournalEntry[] } | undefined>
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
  closeSelectedEntry: () => void
  create: (newJournalEntry: NewApiJournalEntry) => Awaitable<void>
  changeFormData: (
    name: string,
    value: string | BaseSelectOption | undefined | number,
    lineItemIndex?: number,
    accounts?: LedgerAccountBalance[],
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
  reverseEntry: (
    entryId: string,
  ) => ReturnType<typeof Layer.reverseJournalEntry>
}

export interface JournalFormTypes {
  action: string
  data: NewFormJournalEntry
  errors?:
    | {
      entry: FormError[]
      lineItems: FormErrorWithId[]
    }
    | undefined
}

export const useJournal: UseJournal = () => {
  const {
    businessId,
    touch,
    read,
    syncTimestamps,
    hasBeenTouched,
  } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const [form, setForm] = useState<JournalFormTypes | undefined>()
  const [addingEntry, setAddingEntry] = useState(false)
  const [sendingForm, setSendingForm] = useState(false)
  const [apiError, setApiError] = useState<string | undefined>(undefined)

  const queryKey =
    businessId && auth?.access_token && `journal-lines-${businessId}`

  const { data, isLoading, isValidating, error, mutate } = useSWR<{ data: JournalEntry[] }, APIError>(
    queryKey,
    Layer.getJournal(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

  const refetch = () => mutate()

  const closeSelectedEntry = () => {
    setSelectedEntryId(undefined)
  }

  const create = async (newJournalEntry: NewApiJournalEntry) => {
    setSendingForm(true)
    setApiError(undefined)

    try {
      await Layer.createJournalEntries(apiUrl, auth?.access_token, {
        params: { businessId },
        body: newJournalEntry,
      })
      await refetch()
      closeSelectedEntry()
      setForm(undefined)
    }
    catch (_err) {
      setApiError('Submit failed. Please, check your connection and try again.')
    }
    finally {
      setSendingForm(false)
      touch(DataModel.BANK_TRANSACTIONS)
    }
  }

  const addEntry = () => {
    setSelectedEntryId('new')
    setForm({
      action: 'new',
      data: {
        entry_at: (new Date()).toISOString(),
        created_by: 'Test API Integration',
        memo: '',
        line_items: [
          {
            account_identifier: {
              type: '',
              stable_name: '',
              id: '',
              name: '',
              subType: undefined,
            },
            amount: 0,
            direction: Direction.CREDIT,
          },
          {
            account_identifier: {
              type: '',
              stable_name: '',
              id: '',
              name: '',
              subType: undefined,
            },
            amount: 0,
            direction: Direction.DEBIT,
          },
        ],
      },
      errors: undefined,
    })
  }

  const changeFormData = (
    fieldName: string,
    value: string | BaseSelectOption | undefined | number,
    lineItemIndex?: number,
    accounts?: LedgerAccountBalance[],
  ) => {
    if (!form) {
      return null
    }

    let newFormData = form

    if (lineItemIndex !== undefined) {
      const lineItems = form.data.line_items || []
      const lineItem = lineItems[lineItemIndex]

      if (!lineItem) {
        return null
      }

      if (fieldName === 'parent' && accounts) {
        const allAccounts = flattenAccounts(accounts || [])
        const foundParent = allAccounts?.find(
          x => x.id === (value as BaseSelectOption).value,
        )

        if (foundParent) {
          const newLineItem = {
            ...lineItem,
            account_identifier: {
              id: foundParent.id,
              stable_name: foundParent.stable_name,
              type: foundParent.account_type.value,
              name: foundParent.name,
              subType: foundParent.account_subtype
                ? {
                  value: foundParent.account_subtype.value,
                  label: foundParent.account_subtype.display_name,
                }
                : undefined,
            },
          }
          lineItems[lineItemIndex] = newLineItem
        }
      }
      else {
        const newLineItem = {
          ...lineItem,
          [fieldName]: value,
        }

        lineItems[lineItemIndex] = newLineItem
      }

      newFormData = {
        ...form,
        data: {
          ...form.data,
          line_items: lineItems,
        },
      }
    }
    else {
      newFormData = {
        ...form,
        data: {
          ...form.data,
          [fieldName]: value,
        },
      }
    }

    setForm({
      ...newFormData,
    })
  }

  const validateLineItems = (lineItems?: JournalEntryLineItem[]) => {
    if (!lineItems) {
      return null
    }
    const errors: FormErrorWithId[] = []

    lineItems.map((lineItem, idx) => {
      if (!lineItem.account_identifier.id) {
        errors.push({
          id: idx,
          field: 'account',
          message: 'Account is required',
        })
      }

      if (!lineItem.amount) {
        errors.push({
          id: idx,
          field: 'amount',
          message: 'Amount cannot be empty or zero',
        })
      }
    })
    return errors
  }

  const validate = (formData?: JournalFormTypes) => {
    let errors: {
      entry: FormError[]
      lineItems: FormErrorWithId[]
    } = {
      entry: [],
      lineItems: [],
    }

    const lineItems = validateLineItems(formData?.data.line_items)

    if (lineItems) {
      errors = {
        ...errors,
        lineItems,
      }
    }

    return errors
  }

  const submitForm = () => {
    if (!form || !form.action || addingEntry) {
      return null
    }

    const errors = validate(form)

    if (errors.entry.length > 0 || errors.lineItems.length > 0) {
      setForm({
        ...form,
        errors,
      })

      return null
    }

    if (form?.data) {
      void create({
        ...form.data,
        line_items: form.data.line_items?.map(line => ({
          ...line,
          amount: line.amount * 100,
          account_identifier: getAccountIdentifierPayload(line),
        })),
      } as NewApiJournalEntry)
    }
  }

  const addEntryLine = (direction: Direction) => {
    if (!form) {
      return null
    }

    setAddingEntry(true)

    const newEntryLine = {
      account_identifier: {
        type: '',
        stable_name: '',
        id: '',
        name: '',
        subType: undefined,
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
    setTimeout(() => setAddingEntry(false), 100)
  }

  const removeEntryLine = (index: number) => {
    if (!form) {
      return null
    }

    const entryLines = form.data.line_items || []
    entryLines.splice(index, 1)

    setForm({
      ...form,
      data: {
        ...form.data,
        line_items: entryLines,
      },
    })
  }

  const reverseEntry = async (entryId: string) =>
    Layer.reverseJournalEntry(apiUrl, auth?.access_token, {
      params: { businessId, entryId },
    })

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (queryKey && (isLoading || isValidating)) {
      read(DataModel.JOURNAL, queryKey)
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      void refetch()
    }
  }, [syncTimestamps])

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
      setForm(undefined)
      setSelectedEntryId(undefined)
    },
    setForm,
    sendingForm,
    form,
    apiError,
    addEntryLine,
    removeEntryLine,
    reverseEntry,
  }
}
