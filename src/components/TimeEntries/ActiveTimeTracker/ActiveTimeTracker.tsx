import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { hasDraftChanges, toStartPayload, toUpdatePayload } from '@utils/timeTracking/activeTimerDraft'
import { useDeleteTimeEntry } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/[time-entry-id]/useDeleteTimeEntry'
import { UpsertTimeEntryMode, useUpsertTimeEntry } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useUpsertTimeEntry'
import { useActiveTimeTracker, useActiveTimeTrackerGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useStartTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useStartTimeTracker'
import { useStopTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useStopTimeTracker'
import { useActiveTimerDraft } from '@hooks/features/timeTracking/useActiveTimerDraft'
import { useAutosaveActiveTimer } from '@hooks/features/timeTracking/useAutosaveActiveTimer'
import { useElapsedSeconds } from '@hooks/utils/dates/useElapsedSeconds'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ActiveTimeTrackerBanner } from '@components/TimeEntries/ActiveTimeTracker/ActiveTimeTrackerBanner'
import { ActiveTimeTrackerStartDrawer } from '@components/TimeEntries/ActiveTimeTracker/ActiveTimeTrackerStartDrawer'

import './activeTimeTracker.scss'

interface ActiveTimeTrackerProps {
  isDrawerOpen?: boolean
  onDrawerOpenChange?: (isOpen: boolean) => void
}

export const ActiveTimeTracker = ({ isDrawerOpen: externallyControlledIsDrawerOpen, onDrawerOpenChange }: ActiveTimeTrackerProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const { formatSecondsAsDuration } = useIntlFormatter()
  const [internallyControlledIsDrawerOpen, setInternallyControlledIsDrawerOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: activeEntry, isLoading, isError } = useActiveTimeTracker()
  const { trigger: startTimeTracker, isMutating: isStarting } = useStartTimeTracker()
  const { trigger: stopTimeTracker, isMutating: isStopping } = useStopTimeTracker()
  const { trigger: deleteTimeEntry, isMutating: isCancelling } = useDeleteTimeEntry({ timeEntryId: activeEntry?.id })
  const { invalidateActiveTimeTracker } = useActiveTimeTrackerGlobalCacheActions()
  const { trigger: updateTimeEntry, isMutating: isUpdating } = useUpsertTimeEntry({
    mode: UpsertTimeEntryMode.Update,
    timeEntryId: activeEntry?.id ?? '',
  })

  const hasActiveTimer = activeEntry !== null && activeEntry !== undefined
  const isDrawerOpen = externallyControlledIsDrawerOpen ?? internallyControlledIsDrawerOpen

  const setIsDrawerOpen = useCallback((isOpen: boolean) => {
    if (externallyControlledIsDrawerOpen === undefined) {
      setInternallyControlledIsDrawerOpen(isOpen)
    }

    onDrawerOpenChange?.(isOpen)
  }, [externallyControlledIsDrawerOpen, onDrawerOpenChange])

  const {
    draft,
    setSelectedServiceId,
    setSelectedCustomer,
    setMemo,
    reset: resetDraft,
  } = useActiveTimerDraft(activeEntry)

  const elapsedSeconds = useElapsedSeconds(activeEntry?.createdAt)
  const timerDisplayValue = useMemo(
    () => formatSecondsAsDuration(elapsedSeconds),
    [elapsedSeconds, formatSecondsAsDuration],
  )
  const emptyDuration = useMemo(
    () => formatSecondsAsDuration(0),
    [formatSecondsAsDuration],
  )

  const startPayload = useMemo(() => toStartPayload(draft), [draft])

  useAutosaveActiveTimer({
    activeEntry,
    draft,
    updateTimeEntry,
    setError: setActionError,
    errorMessage: t('timeTracking:error.update_timer', 'Failed to update timer. Please try again.'),
  })

  useEffect(() => {
    if (!hasActiveTimer) {
      setActionError(null)
    }
  }, [hasActiveTimer])

  const handleDrawerOpenChange = useCallback((nextIsOpen: boolean) => {
    setIsDrawerOpen(nextIsOpen)
    if (!nextIsOpen) {
      setActionError(null)
    }
  }, [setIsDrawerOpen])

  const handleStartTimer = useCallback(async () => {
    if (!startPayload) {
      setActionError(t('timeTracking:validation.service_required', 'Service is a required field.'))
      return
    }

    setActionError(null)

    try {
      await startTimeTracker(startPayload)
      resetDraft()
      setIsDrawerOpen(false)
    }
    catch {
      setActionError(t('timeTracking:error.start_timer', 'Failed to start timer. Please try again.'))
    }
  }, [resetDraft, setIsDrawerOpen, startPayload, startTimeTracker, t])

  const handleCompleteTimer = useCallback(async () => {
    if (!activeEntry || !draft.selectedServiceId) {
      return
    }

    setActionError(null)

    const draftWithService = { ...draft, selectedServiceId: draft.selectedServiceId }

    if (hasDraftChanges(activeEntry, draftWithService)) {
      try {
        await updateTimeEntry(toUpdatePayload(activeEntry, draftWithService))
      }
      catch {
        setActionError(t('timeTracking:error.update_timer', 'Failed to update timer. Please try again.'))
        return
      }
    }

    try {
      await stopTimeTracker()
      resetDraft()
      setIsDrawerOpen(false)
    }
    catch {
      setActionError(t('timeTracking:error.complete_timer', 'Failed to complete timer. Please try again.'))
    }
  }, [activeEntry, draft, resetDraft, setIsDrawerOpen, stopTimeTracker, t, updateTimeEntry])

  const handleCancelTimer = useCallback(async () => {
    if (!activeEntry) {
      return
    }

    setActionError(null)

    try {
      await deleteTimeEntry()
      void invalidateActiveTimeTracker()
      resetDraft()
      setIsDrawerOpen(false)
    }
    catch {
      setActionError(t('timeTracking:error.cancel_timer', 'Failed to cancel timer. Please try again.'))
    }
  }, [activeEntry, deleteTimeEntry, invalidateActiveTimeTracker, resetDraft, setIsDrawerOpen, t])

  const onStartTimer = useCallback(() => {
    void handleStartTimer()
  }, [handleStartTimer])

  const onCompleteTimer = useCallback(() => {
    void handleCompleteTimer()
  }, [handleCompleteTimer])

  const onCancelTimer = useCallback(() => {
    void handleCancelTimer()
  }, [handleCancelTimer])

  if (isLoading) {
    return null
  }

  if (isError) {
    return (
      <Container name='ActiveTimeTracker'>
        <VStack pi='lg' pbe='md'>
          <DataState
            status={DataStateStatus.failed}
            title={t('timeTracking:error.load_active_timer', 'Failed to load active timer. Please check your connection and try again.')}
          />
        </VStack>
      </Container>
    )
  }

  return (
    <>
      {hasActiveTimer && (
        <ActiveTimeTrackerBanner
          actionError={actionError}
          timerDisplayValue={timerDisplayValue}
          selectedServiceId={draft.selectedServiceId}
          onSelectedServiceIdChange={setSelectedServiceId}
          selectedCustomer={draft.selectedCustomer}
          onSelectedCustomerChange={setSelectedCustomer}
          onCancelTimer={onCancelTimer}
          onCompleteTimer={onCompleteTimer}
          isCancelling={isCancelling}
          isStopping={isStopping}
          isUpdating={isUpdating}
        />
      )}

      {!hasActiveTimer && (
        <ActiveTimeTrackerStartDrawer
          isOpen={isDrawerOpen}
          onOpenChange={handleDrawerOpenChange}
          isMobile={isMobile}
          actionError={actionError}
          duration={emptyDuration}
          selectedServiceId={draft.selectedServiceId}
          onSelectedServiceIdChange={setSelectedServiceId}
          selectedCustomer={draft.selectedCustomer}
          onSelectedCustomerChange={setSelectedCustomer}
          memo={draft.memo}
          onMemoChange={setMemo}
          onStartTimer={onStartTimer}
          isStarting={isStarting}
          isStopping={isStopping}
          isCancelling={isCancelling}
          canStartTimer={!!startPayload}
        />
      )}
    </>
  )
}
