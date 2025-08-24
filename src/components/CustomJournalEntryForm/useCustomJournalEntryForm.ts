import { useCallback, useMemo, useState, useRef } from 'react'
import { useStore, revalidateLogic } from '@tanstack/react-form'
import { useAppForm } from '../../features/forms/hooks/useForm'
import { type CustomJournalEntry, type CustomJournalEntryForm } from '../../schemas/generalLedger/customJournalEntry'
import { useCreateCustomJournalEntry } from '../../features/ledger/entries/api/useCreateCustomJournalEntry'
import {
  convertCustomJournalEntryFormToParams,
  getCustomJournalEntryFormDefaultValues,
  getCustomJournalEntryFormInitialValues,
  validateCustomJournalEntryForm,
} from './formUtils'
import { LedgerEntryDirection } from '../../schemas/generalLedger/ledgerAccount'
import { BigDecimal as BD } from 'effect'
import { BIG_DECIMAL_ZERO, BIG_DECIMAL_ONE_HUNDRED, convertBigDecimalToCents } from '../../utils/bigDecimalUtils'

const BIG_DECIMAL_ONE_CENT = BD.unsafeDivide(BD.fromBigInt(BigInt(1)), BIG_DECIMAL_ONE_HUNDRED)

type onSuccessFn = (entry: CustomJournalEntry) => void
type UseCustomJournalEntryFormProps = {
  onSuccess: onSuccessFn
  mode?: 'Create' | 'Update'
  entry?: CustomJournalEntry
  createdBy: string
}

export const useCustomJournalEntryForm = (props: UseCustomJournalEntryFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, mode = 'Create', entry, createdBy } = props

  const { trigger: createCustomJournalEntry } = useCreateCustomJournalEntry()

  const defaultValuesRef = useRef<CustomJournalEntryForm>(
    mode === 'Update' && entry
      ? getCustomJournalEntryFormInitialValues(entry)
      : getCustomJournalEntryFormDefaultValues(),
  )
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: CustomJournalEntryForm }) => {
    try {
      // Convert the form to the request shape
      const createCustomJournalEntryParams = convertCustomJournalEntryFormToParams(value, createdBy)

      const { data: customJournalEntry } = await createCustomJournalEntry(createCustomJournalEntryParams)

      setSubmitError(undefined)
      onSuccess(customJournalEntry)
    }
    catch (e) {
      console.error(e)
      setSubmitError('Something went wrong. Please try again.')
    }
  }, [onSuccess, createCustomJournalEntry, createdBy])

  const validators = useMemo(() => ({
    onDynamic: ({ value }: { value: CustomJournalEntryForm }) => validateCustomJournalEntryForm(value),
  }), [])

  const form = useAppForm<CustomJournalEntryForm>({
    defaultValues,
    onSubmit,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  const isDirty = useStore(form.store, state => state.isDirty)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  const formState = useMemo(() => ({
    isDirty,
    isSubmitting,
  }), [isDirty, isSubmitting])

  // Calculate totals for debit/credit validation
  const { totalDebits, totalCredits, isBalanced } = useStore(form.store, (state) => {
    const lineItems = state.values.lineItems || []
    const validLineItems = lineItems.filter(item => item.accountIdentifier && BD.greaterThan(item.amount, BIG_DECIMAL_ZERO))

    const totalDebits = validLineItems
      .filter(item => item.direction === LedgerEntryDirection.Debit)
      .reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

    const totalCredits = validLineItems
      .filter(item => item.direction === LedgerEntryDirection.Credit)
      .reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

    const difference = BD.subtract(totalDebits, totalCredits)
    const isBalanced = BD.lessThanOrEqualTo(BD.abs(difference), BIG_DECIMAL_ONE_CENT)

    return {
      totalDebits: convertBigDecimalToCents(totalDebits),
      totalCredits: convertBigDecimalToCents(totalCredits),
      isBalanced,
    }
  })

  const totals = useMemo(() => ({
    totalDebits,
    totalCredits,
    isBalanced,
  }), [totalDebits, totalCredits, isBalanced])

  return useMemo(() => (
    { form, formState, totals, submitError }
  ), [form, formState, totals, submitError])
}
