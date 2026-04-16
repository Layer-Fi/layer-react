import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/customer'
import { EMPTY_DRAFT, toStartPayload } from '@utils/timeTracking/activeTimerDraft'
import { useStartTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useStartTimeTracker'
import { useAppForm } from '@hooks/features/forms/useForm'

export type StartTimerFormValues = {
  selectedServiceId: string | null
  selectedCustomer: Customer | null
  memo: string
}

export type StartTimerFormType = ReturnType<typeof useAppForm<StartTimerFormValues>>

type UseStartTimerFormProps = {
  onStarted: () => void
}

export const useStartTimerForm = ({ onStarted }: UseStartTimerFormProps) => {
  const { t } = useTranslation()
  const [actionError, setActionError] = useState<string | null>(null)
  const { trigger: startTimeTracker, isMutating: isStarting } = useStartTimeTracker()

  const onSubmit = useCallback(async ({
    value,
    formApi,
  }: {
    value: StartTimerFormValues
    formApi: { reset: (values?: StartTimerFormValues) => void }
  }) => {
    const payload = toStartPayload(value)
    if (!payload) {
      setActionError(t('timeTracking:validation.service_required', 'Service is a required field.'))
      return
    }

    setActionError(null)

    try {
      await startTimeTracker(payload)
      formApi.reset(EMPTY_DRAFT)
      onStarted()
    }
    catch {
      setActionError(t('timeTracking:error.start_timer', 'Failed to start timer. Please try again.'))
    }
  }, [onStarted, startTimeTracker, t])

  const form = useAppForm<StartTimerFormValues>({
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
