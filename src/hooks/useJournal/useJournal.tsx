import { useState } from 'react'
import { Layer } from '../../api/layer'
import { Direction, FormError, FormErrorWithId } from '../../types'
import { LedgerAccountBalance } from '../../types/chart_of_accounts'
import { BaseSelectOption } from '../../types/general'
import {
  JournalEntry,
  JournalEntryLineItem,
  NewJournalEntry,
} from '../../types/journal'
import { flattenAccounts } from '../useChartOfAccounts/useChartOfAccounts'
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
    lineItemIndex?: number,
    accounts?: LedgerAccountBalance[] | undefined,
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
}

export interface JournalFormTypes {
  action: string
  data: NewJournalEntry
  errors?:
    | {
        entry: FormError[]
        lineItems: FormErrorWithId[]
      }
    | undefined
}

export const useJournal: UseJournal = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const [form, setForm] = useState<JournalFormTypes | undefined>()
  const [addingEntry, setAddingEntry] = useState(false)
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
      closeSelectedEntry()
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
        entry_at: '',
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
    accounts?: LedgerAccountBalance[] | undefined,
  ) => {
    if (!form) {
      return
    }

    let newFormData = form

    if (lineItemIndex !== undefined) {
      const lineItems = form.data.line_items || []
      const lineItem = lineItems[lineItemIndex]

      if (!lineItem) {
        return
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
      } else {
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
    } else {
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
      return
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
      return
    }

    const errors = validate(form)

    if (errors.entry.length > 0 || errors.lineItems.length > 0) {
      setForm({
        ...form,
        errors,
      })

      return
    }

    if (form?.data) {
      create({
        ...form.data,
        line_items: form.data.line_items?.map(line => ({
          ...line,
          account_identifier: {
            type: 'StableName',
            stable_name: line.account_identifier.stable_name,
          },
        })),
      } as NewJournalEntry)
    }
  }

  const addEntryLine = (direction: Direction) => {
    if (!form) {
      return
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
      return
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
    removeEntryLine,
  }
}
