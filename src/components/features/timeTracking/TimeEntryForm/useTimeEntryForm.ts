import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type TimeEntry, type TimeEntryForm, UpsertTimeEntrySchema } from '@schemas/timeTracking/timeTracking'
import { useUpsertTimeEntry } from '@api/businesses/[business-id]/time-tracking/time-entries/upsert'
import { useAppForm } from '@hooks/features/forms/useForm'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { convertTimeEntryFormToUpsertTimeEntry, getTimeEntryFormDefaultValues, validateTimeEntryForm } from '@features/timeTracking/TimeEntryForm/formUtils'

type onSuccessFn = (entry: TimeEntry) => void
type UseTimeEntryFormProps = { onSuccess: onSuccessFn, entry?: TimeEntry }

export const useTimeEntryForm = (props: UseTimeEntryFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, entry } = props

  const { trigger: upsertTimeEntry } = useUpsertTimeEntry(
    entry
      ? { mode: UpsertMode.Update, timeEntryId: entry.id }
      : { mode: UpsertMode.Create },
  )

  const defaultValuesRef = useRef<TimeEntryForm>(getTimeEntryFormDefaultValues(entry))
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: TimeEntryForm }) => {
    setSubmitError(undefined)

    try {
      const entryParams = convertTimeEntryFormToUpsertTimeEntry(value, entry)
      const upsertRequest = Schema.encodeUnknownSync(UpsertTimeEntrySchema)(entryParams)
      const result = await upsertTimeEntry(upsertRequest)

      onSuccess(result)
    }
    catch {
      setSubmitError(t('common:error.something_went_wrong_please_try_again', 'Something went wrong. Please try again.'))
    }
  }, [entry, onSuccess, upsertTimeEntry, t])

  const onDynamic = useCallback(({ value }: { value: TimeEntryForm }) => {
    return validateTimeEntryForm({ entry: value }, t)
  }, [t])

  const validators = useMemo(() => ({ onDynamic }), [onDynamic])

  const form = useAppForm<TimeEntryForm>({
    defaultValues,
    onSubmit,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  useEffect(() => {
    form.reset(getTimeEntryFormDefaultValues(entry))
  }, [entry, form])

  return useMemo(() => ({ form, submitError }), [form, submitError])
}
