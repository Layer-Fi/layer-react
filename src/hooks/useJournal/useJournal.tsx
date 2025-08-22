import { useState, useMemo, useCallback } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { FormError, FormErrorWithId } from '../../types'
import { BaseSelectOption, DataModel } from '../../types/general'
import { LedgerEntry } from '../../schemas/generalLedger/ledgerEntry'
import { getAccountIdentifierPayload } from '../../utils/journal'
import { flattenAccounts } from '../useChartOfAccounts/useChartOfAccounts'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useListLedgerEntries } from '../../features/ledger/entries/api/useListLedgerEntries'
import { usePnlDetailLinesInvalidator } from '../useProfitAndLoss/useProfitAndLossDetailLines'
import { LedgerAccount, LedgerEntryDirection, NestedLedgerAccount } from '../../schemas/generalLedger/ledgerAccount'
import { CreateCustomJournalEntry, CreateCustomJournalEntryLineItem } from '../../schemas/generalLedger/customJournalEntry'
import { ListLedgerEntriesReturn } from '../../features/ledger/entries/api/useListLedgerEntries'

type UseJournal = () => {
  data?: ReadonlyArray<LedgerEntry>
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
  create: (newJournalEntry: CreateCustomJournalEntry) => void
  changeFormData: (
    name: string,
    value: string | BaseSelectOption | undefined | number,
    lineItemIndex?: number,
    accounts?: LedgerAccount[],
  ) => void
  submitForm: () => Promise<null | undefined>
  cancelForm: () => void
  addEntry: () => void
  sendingForm: boolean
  form?: JournalFormTypes
  apiError?: string
  setForm: (form?: JournalFormTypes) => void
  addEntryLine: (direction: LedgerEntryDirection) => void
  removeEntryLine: (index: number) => void
  reverseEntry: (entryId: string) => ReturnType<typeof Layer.reverseJournalEntry>
  hasMore: boolean
  fetchMore: () => Promise<void>
}

export interface JournalFormTypes {
  action: string
  data: CreateCustomJournalEntry
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
  } = useLayerContext()
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

    return paginatedData.flatMap(page => page.data) as ReadonlyArray<LedgerEntry>
  }, [paginatedData])

  const hasMore = useMemo(() => {
    if (paginatedData && paginatedData.length > 0) {
      const lastPage = paginatedData[paginatedData.length - 1]
      return Boolean(
        lastPage.meta?.pagination.cursor
        && lastPage.meta?.pagination.has_more,
      )
    }
    return false
  }, [paginatedData])

  const fetchMore = useCallback(async () => {
    if (hasMore) {
      await setSize(size + 1)
    }
  }, [hasMore, setSize, size])

  const refetch = () => mutate()

  const closeSelectedEntry = () => {
    setSelectedEntryId(undefined)
  }

  const { invalidatePnlDetailLines } = usePnlDetailLinesInvalidator()

  const create = async (newJournalEntry: CreateCustomJournalEntry) => {
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
      touch(DataModel.PROFIT_AND_LOSS)
      void invalidatePnlDetailLines()
    }
  }

  const addEntry = () => {
    setSelectedEntryId('new')
    setForm({
      action: 'new',
      data: {
        entryAt: (new Date()),
        createdBy: 'Test API Integration',
        memo: '',
        lineItems: [
          {
            accountIdentifier: {
              type: 'StableName',
              stableName: '',
            },
            amount: 0,
            direction: LedgerEntryDirection.Credit,
          },
          {
            accountIdentifier: {
              type: 'StableName',
              stableName: '',
            },
            amount: 0,
            direction: LedgerEntryDirection.Debit,
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
    accounts?: NestedLedgerAccount[],
  ) => {
    if (!form) {
      return null
    }

    let newFormData = form

    if (lineItemIndex !== undefined) {
      const lineItems = form.data.lineItems || []
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
            accountIdentifier: {
              type: 'AccountId' as const,
              id: foundParent.id,
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
          lineItems: lineItems,
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

  const validateLineItems = (lineItems?: CreateCustomJournalEntryLineItem[]) => {
    if (!lineItems) {
      return null
    }
    const errors: FormErrorWithId[] = []

    lineItems.map((lineItem, idx) => {
      if (!lineItem.accountIdentifier) {
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

    const lineItems = validateLineItems(formData?.data.lineItems)

    if (lineItems) {
      errors = {
        ...errors,
        lineItems,
      }
    }

    return errors
  }

  const submitForm = async () => {
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
      await create({
        ...form.data,
        lineItems: form.data.lineItems?.map(line => ({
          ...line,
          amount: line.amount * 100,
          acc: getAccountIdentifierPayload(line),
        })),
      })
    }
  }

  const addEntryLine = (direction: LedgerEntryDirection) => {
    if (!form) {
      return null
    }

    setAddingEntry(true)

    const newEntryLine = {
      accountIdentifier: {
        type: 'AccountId' as const,
        id: '',
      },
      amount: 0,
      direction,
    }

    const entryLines = form?.data.lineItems || []
    entryLines.push(newEntryLine)

    setForm({
      ...form,
      data: {
        ...form.data,
        lineItems: entryLines,
      },
    })
    setTimeout(() => setAddingEntry(false), 100)
  }

  const removeEntryLine = (index: number) => {
    if (!form) {
      return null
    }

    const entryLines = form.data.lineItems || []
    entryLines.splice(index, 1)

    setForm({
      ...form,
      data: {
        ...form.data,
        lineItems: entryLines,
      },
    })
  }

  const reverseEntry = async (entryId: string) =>
    Layer.reverseJournalEntry(apiUrl, auth?.access_token, {
      params: { businessId, entryId },
    })

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
    cancelForm: () => {
      setForm(undefined), setSelectedEntryId(undefined)
    },
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
