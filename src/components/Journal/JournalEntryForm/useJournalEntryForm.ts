import { useCallback, useMemo, useRef, useState } from 'react'
import { revalidateLogic, useStore } from '@tanstack/react-form'
import { Schema } from 'effect'
import i18next from 'i18next'

import { UpsertJournalEntryMode, useUpsertJournalEntry } from '@hooks/api/businesses/[business-id]/ledger/journal-entries/useUpsertJournalEntry'
import { useAppForm } from '@hooks/features/forms/useForm'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { convertJournalEntryFormToParams, getJournalEntryFormDefaultValues, getJournalEntryFormInitialValues, validateJournalEntryForm } from '@components/Journal/JournalEntryForm/formUtils'
import { type ApiCustomJournalEntryWithEntry, type JournalEntryForm, UpsertJournalEntrySchema } from '@components/Journal/JournalEntryForm/journalEntryFormSchemas'

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
        content: i18next.t('journalEntryJournalentrynumberPosted', 'Journal entry #{{journalEntryNumber}} posted', { journalEntryNumber }),
        type: 'success',
      })

      setSubmitError(undefined)
      onSuccess(journalEntry)
    }
    catch (e) {
      console.error(e)
      setSubmitError(i18next.t('somethingWentWrongPleaseTryAgain', 'Something went wrong. Please try again.'))
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
