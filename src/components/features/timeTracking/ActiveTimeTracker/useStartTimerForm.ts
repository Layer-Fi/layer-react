import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type ActiveTimerDraft, EMPTY_DRAFT, toStartPayload } from '@utils/features/timeTracking/activeTimerDraft'
import { ApiEnumErrorType, APIError } from '@utils/shared/api/apiError'
import { usePostStartTimeTracker } from '@api/businesses/[business-id]/time-tracking/tracker/start/post'
import { useAppForm } from '@blocks/Form/useForm'

type UseStartTimerFormProps = {
  onStarted: () => void
}

const isActiveTimerAlreadyExistsError = (error: unknown) => {
  if (!(error instanceof APIError)) return false
  return error.messages?.some(
    m => m.error_enum === ApiEnumErrorType.SpecifiedBadRequest,
  ) === true
}

export const useStartTimerForm = ({ onStarted }: UseStartTimerFormProps) => {
  const { t } = useTranslation()
  const [actionError, setActionError] = useState<string | null>(null)
  const { trigger: startTimeTracker, isMutating: isStarting } = usePostStartTimeTracker()

  const onSubmit = useCallback(async ({
    value,
    formApi,
  }: {
    value: ActiveTimerDraft
    formApi: { reset: (values?: ActiveTimerDraft) => void }
  }) => {
    const payload = toStartPayload(value)
    if (!payload) {
      setActionError(t('timeTracking:ActiveTimeTracker.useStartTimerForm.validation.service_required', 'Service is a required field.'))
      return
    }

    setActionError(null)

    try {
      await startTimeTracker(payload)
      formApi.reset(EMPTY_DRAFT)
      onStarted()
    }
    catch (error) {
      if (isActiveTimerAlreadyExistsError(error)) {
        setActionError(t('timeTracking:ActiveTimeTracker.useStartTimerForm.error.start_timer_already_active', 'A timer is already running. Please reload the page.'))
      }
      else {
        setActionError(t('timeTracking:ActiveTimeTracker.useStartTimerForm.error.start_timer', 'Failed to start timer. Please try again.'))
      }
    }
  }, [onStarted, startTimeTracker, t])

  const form = useAppForm<ActiveTimerDraft>({
    defaultValues: EMPTY_DRAFT,
    onSubmit,
  })

  const clearActionError = useCallback(() => {
    setActionError(null)
  }, [])

  return useMemo(() => ({
    form,
    state: {
      actionError,
      isStarting,
    },
    clearActionError,
  }), [form, actionError, isStarting, clearActionError])
}
