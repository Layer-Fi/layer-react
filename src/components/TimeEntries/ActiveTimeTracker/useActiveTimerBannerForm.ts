import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/customer'
import { type TimeEntry } from '@schemas/timeTracking'
import { hasDraftChanges, toUpdatePayload } from '@utils/timeTracking/activeTimerDraft'
import { useDeleteTimeEntry } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/[time-entry-id]/useDeleteTimeEntry'
import { UpsertTimeEntryMode, useUpsertTimeEntry } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useUpsertTimeEntry'
import { useActiveTimeTrackerGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useStopTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useStopTimeTracker'
import { useAppForm } from '@hooks/features/forms/useForm'

const AUTOSAVE_DEBOUNCE_MS = 500

export type ActiveTimerBannerFormValues = {
  selectedServiceId: string | null
  selectedCustomer: Customer | null
  memo: string
}

export type ActiveTimerBannerFormType = ReturnType<typeof useAppForm<ActiveTimerBannerFormValues>>

type UseActiveTimerBannerFormProps = {
  activeEntry: TimeEntry
}

export const useActiveTimerBannerForm = ({ activeEntry }: UseActiveTimerBannerFormProps) => {
  const { t } = useTranslation()
  const [actionError, setActionError] = useState<string | null>(null)

  const { trigger: stopTimeTracker, isMutating: isStopping } = useStopTimeTracker()
  const { trigger: deleteTimeEntry, isMutating: isCancelling } = useDeleteTimeEntry({ timeEntryId: activeEntry.id })
  const { trigger: updateTimeEntry, isMutating: isUpdating } = useUpsertTimeEntry({
    mode: UpsertTimeEntryMode.Update,
    timeEntryId: activeEntry.id,
  })
  const { invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()

  const defaultValues = useMemo<ActiveTimerBannerFormValues>(() => ({
    selectedServiceId: activeEntry.service?.id ?? null,
    selectedCustomer: activeEntry.customer ?? null,
    memo: activeEntry.memo ?? '',
  }), [activeEntry])

  const onSubmit = useCallback(async ({ value }: { value: ActiveTimerBannerFormValues }) => {
    if (!value.selectedServiceId) return
    setActionError(null)
    const draft = { ...value, selectedServiceId: value.selectedServiceId }

    if (hasDraftChanges(activeEntry, draft)) {
      try {
        await updateTimeEntry(toUpdatePayload(activeEntry, draft))
      }
      catch {
        setActionError(t('timeTracking:error.update_timer', 'Failed to update timer. Please try again.'))
        return
      }
    }

    try {
      await stopTimeTracker()
    }
    catch {
      setActionError(t('timeTracking:error.complete_timer', 'Failed to complete timer. Please try again.'))
    }
  }, [activeEntry, stopTimeTracker, t, updateTimeEntry])

  const form = useAppForm<ActiveTimerBannerFormValues>({ defaultValues, onSubmit })

  const syncedIdRef = useRef(activeEntry.id)
  useEffect(() => {
    if (syncedIdRef.current !== activeEntry.id) {
      syncedIdRef.current = activeEntry.id
      form.reset(defaultValues)
    }
  }, [activeEntry.id, defaultValues, form])

  const values = useStore(form.store, s => s.values)
  useEffect(() => {
    if (!values.selectedServiceId) return
    const draft = { ...values, selectedServiceId: values.selectedServiceId }
    if (!hasDraftChanges(activeEntry, draft)) return

    setActionError(null)
    const id = window.setTimeout(() => {
      void updateTimeEntry(toUpdatePayload(activeEntry, draft)).catch(() => {
        setActionError(t('timeTracking:error.update_timer', 'Failed to update timer. Please try again.'))
      })
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [values, activeEntry, updateTimeEntry, t])

  const cancelTimer = useCallback(async () => {
    setActionError(null)
    try {
      await deleteTimeEntry()
      void invalidateActiveTimeTracker()
    }
    catch {
      setActionError(t('timeTracking:error.cancel_timer', 'Failed to cancel timer. Please try again.'))
    }
  }, [deleteTimeEntry, invalidateActiveTimeTracker, t])

  const completeTimer = useCallback(() => {
    void form.handleSubmit()
  }, [form])

  const triggerCancelTimer = useCallback(() => {
    void cancelTimer()
  }, [cancelTimer])

  return useMemo(() => ({
    form,
    actions: {
      completeTimer,
      cancelTimer: triggerCancelTimer,
    },
    state: {
      actionError,
      isCancelling,
      isStopping,
      isUpdating,
    },
  }), [form, completeTimer, triggerCancelTimer, actionError, isCancelling, isStopping, isUpdating])
}
