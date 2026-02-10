import { useCallback, useMemo, useState } from 'react'

import { type FormError, type FormErrorWithId } from '@internal-types/general'
import { type BaseSelectOption } from '@internal-types/general'
import {
  type JournalEntry,
  type JournalEntryLineItem,
  type NewApiJournalEntry,
  type NewFormJournalEntry,
} from '@internal-types/journal'
import { type LedgerAccountBalance } from '@internal-types/journal'
import { LedgerEntryDirection } from '@schemas/generalLedger/ledgerAccount'
import { getAccountIdentifierPayload } from '@utils/journal'
import { Layer } from '@api/layer'
import { useAuth } from '@hooks/useAuth'
import { useProfitAndLossGlobalInvalidator } from '@hooks/useProfitAndLoss/useProfitAndLossGlobalInvalidator'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { type ListLedgerEntriesReturn, useListLedgerEntries } from '@features/ledger/entries/api/useListLedgerEntries'

type UseJournal = () => {
  data?: ReadonlyArray<JournalEntry>
  isLoading?: boolean
  isLoadingEntry?: boolean
  isValidating?: boolean
  isValidatingEntry?: boolean
  error?: unknown
  errorEntry?: unknown
  refetch: () => Promise<ListLedgerEntriesReturn[] | undefined>
  selectedEntryId?: string
  setSelectedEntryId: (id?: string) => void
  closeSelectedEntry: () => void
  create: (newJournalEntry: NewApiJournalEntry) => Promise<void>
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
  addEntryLine: () => void
  removeEntryLine: (index: number) => void
  reverseEntry: (entryId: string) => ReturnType<typeof Layer.reverseJournalEntry>
  hasMore: boolean
  fetchMore: () => void
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

export const flattenAccounts = (
  accounts: LedgerAccountBalance[],
): LedgerAccountBalance[] =>
  accounts
    .flatMap(a => [a, flattenAccounts(a.sub_accounts || [])])
    .flat()
    .filter(id => id)

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

export const useJournal: UseJournal = () => {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()

  const [form, setForm] = useState<JournalFormTypes | undefined>()
  const [addingEntry, setAddingEntry] = useState(false)
  const [sendingForm, setSendingForm] = useState(false)
  const [apiError, setApiError] = useState<string | undefined>(undefined)

  const {
    data: paginatedData,
    isLoading,
    isValidating,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    error,
    mutate,
    size,
    setSize,
  } = useListLedgerEntries({
    sort_by: 'entry_at',
    sort_order: 'DESC',
    limit: 150,
  })

  const data = useMemo(() => {
    if (!paginatedData) return undefined

    return paginatedData.flatMap(page => page.data) as ReadonlyArray<JournalEntry>
  }, [paginatedData])

  const hasMore = useMemo(() => {
    if (paginatedData && paginatedData.length > 0) {
      const lastPage = paginatedData[paginatedData.length - 1]
      return Boolean(
        lastPage?.meta?.pagination.cursor
        && lastPage?.meta?.pagination.has_more,
      )
    }
    return false
  }, [paginatedData])

  const fetchMore = useCallback(() => {
    if (hasMore) {
      void setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const refetch = useCallback(() => mutate(), [mutate])

  const closeSelectedEntry = useCallback(() => {
    setSelectedEntryId(undefined)
  }, [])

  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const create = useCallback(async (newJournalEntry: NewApiJournalEntry) => {
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
      void debouncedInvalidateProfitAndLoss()
    }
  }, [apiUrl, auth?.access_token, businessId, refetch, closeSelectedEntry, debouncedInvalidateProfitAndLoss])

  const addEntry = useCallback(() => {
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
            direction: LedgerEntryDirection.Credit,
            job: null,
            description: '',
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
            direction: LedgerEntryDirection.Debit,
            job: null,
            description: '',
          },
        ],
        notes: '',
      },
      errors: undefined,
    })
  }, [])

  const changeFormData = useCallback((
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
        const allAccounts = flattenAccounts(accounts)
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
  }, [form])

  const submitForm = useCallback(() => {
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
  }, [form, addingEntry, create])

  const addEntryLine = useCallback(() => {
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
      direction: 'DEBIT' as LedgerEntryDirection,
      job: null,
      description: '',
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
  }, [form])

  const removeEntryLine = useCallback((index: number) => {
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
  }, [form])

  const reverseEntry = useCallback(async (entryId: string) =>
    Layer.reverseJournalEntry(apiUrl, auth?.access_token, {
      params: { businessId, entryId },
    }), [apiUrl, auth?.access_token, businessId])

  const cancelForm = useCallback(() => {
    setForm(undefined)
    setSelectedEntryId(undefined)
  }, [])

  return {
    data,
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
    cancelForm,
    setForm,
    sendingForm,
    form,
    apiError,
    addEntryLine,
    removeEntryLine,
    reverseEntry,
    hasMore,
    fetchMore,
    isLoadingEntry: false,
    isValidatingEntry: false,
    errorEntry: undefined,
  }
}
