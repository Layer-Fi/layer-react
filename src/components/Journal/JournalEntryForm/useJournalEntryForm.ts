import { useCallback, useMemo, useState, useRef } from 'react'
import { useStore, revalidateLogic } from '@tanstack/react-form'
import { useAppForm } from '../../../features/forms/hooks/useForm'
import { UpsertJournalEntrySchema, type JournalEntryForm } from './journalEntryFormSchemas'
import { useUpsertJournalEntry, UpsertJournalEntryMode } from './useUpsertJournalEntry'
import { Schema } from 'effect'
import { convertJournalEntryFormToParams, getJournalEntryFormDefaultValues, getJournalEntryFormInitialValues, validateJournalEntryForm } from './formUtils'
import { useLayerContext } from '../../../contexts/LayerContext'
import { entryNumber } from '../../../utils/journal'
import type { JournalEntry } from '../../../types/journal'

type onSuccessFn = (journalEntry: JournalEntry) => void
type UseJournalEntryFormProps =
  | { onSuccess: onSuccessFn, mode: UpsertJournalEntryMode.Create }
  | { onSuccess: onSuccessFn, mode: UpsertJournalEntryMode.Update, journalEntry: JournalEntry }

function isUpdateMode(props: UseJournalEntryFormProps): props is { onSuccess: onSuccessFn, mode: UpsertJournalEntryMode.Update, journalEntry: JournalEntry } {
  return props.mode === UpsertJournalEntryMode.Update
}

export const useJournalEntryForm = (props: UseJournalEntryFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, mode } = props
  const { addToast } = useLayerContext()

  const upsertJournalEntryProps = mode === UpsertJournalEntryMode.Update ? { mode, journalEntryId: props.journalEntry.id } : { mode }
  const { trigger: upsertJournalEntry } = useUpsertJournalEntry(upsertJournalEntryProps)

  const defaultValuesRef = useRef<JournalEntryForm>(
    isUpdateMode(props)
      ? getJournalEntryFormInitialValues(props.journalEntry)
      : getJournalEntryFormDefaultValues(),
  )
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: JournalEntryForm }) => {
    try {
      // Convert the `JournalEntryForm` schema to the request shape for `upsertJournalEntry`. This will
      // throw an error if the request shape is not valid.
      const upsertJournalEntryParams = convertJournalEntryFormToParams(value)
      console.log('upsertJournalEntryParams', upsertJournalEntryParams)
      const upsertJournalEntryRequest = Schema.encodeUnknownSync(UpsertJournalEntrySchema)(upsertJournalEntryParams)

      const { data: journalEntry } = await upsertJournalEntry(upsertJournalEntryRequest)

      // Show success toast with journal entry number
      const journalEntryNumber = entryNumber(journalEntry)
      addToast({
        content: `Journal entry #${journalEntryNumber} posted`,
        type: 'success',
      })

      setSubmitError(undefined)
      onSuccess(journalEntry)
    }
    catch (e) {
      console.error(e)
      setSubmitError('Something went wrong. Please try again.')
    }
  }, [onSuccess, upsertJournalEntry, addToast])

  const validators = useMemo(() => ({
    onDynamic: validateJournalEntryForm,
  }), [])

  const form = useAppForm<JournalEntryForm>({
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

  return useMemo(() => (
    { form, formState, submitError }),
  [form, formState, submitError])
}
