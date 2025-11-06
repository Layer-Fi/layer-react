import { useCallback, useMemo, useState, useRef } from 'react'
import { useStore, revalidateLogic } from '@tanstack/react-form'
import { useAppForm } from '@features/forms/hooks/useForm'
import { ApiCustomJournalEntryWithEntry, UpsertJournalEntrySchema, type JournalEntryForm } from '@components/Journal/JournalEntryForm/journalEntryFormSchemas'
import { useUpsertJournalEntry, UpsertJournalEntryMode } from '@components/Journal/JournalEntryForm/useUpsertJournalEntry'
import { Schema } from 'effect'
import { convertJournalEntryFormToParams, getJournalEntryFormDefaultValues, getJournalEntryFormInitialValues, validateJournalEntryForm } from '@components/Journal/JournalEntryForm/formUtils'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type onSuccessFn = (journalEntry: ApiCustomJournalEntryWithEntry) => void
type UseJournalEntryFormProps =
  | { onSuccess: onSuccessFn, mode: UpsertJournalEntryMode.Create }
  | { onSuccess: onSuccessFn, mode: UpsertJournalEntryMode.Update, journalEntry: ApiCustomJournalEntryWithEntry }

function isUpdateMode(props: UseJournalEntryFormProps): props is {
  onSuccess: onSuccessFn
  mode: UpsertJournalEntryMode.Update
  journalEntry: ApiCustomJournalEntryWithEntry } {
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
      const upsertJournalEntryParams = convertJournalEntryFormToParams(value)
      const upsertJournalEntryRequest = Schema.encodeUnknownSync(UpsertJournalEntrySchema)(upsertJournalEntryParams)

      const { data: journalEntry } = await upsertJournalEntry(upsertJournalEntryRequest)

      const journalEntryNumber = journalEntry.entry.entryNumber
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
