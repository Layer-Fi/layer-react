import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/customer'
import { type StartTrackerEncoded, type UpsertTimeEntryEncoded } from '@schemas/timeTracking'
import { useDeleteTimeEntry } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/[time-entry-id]/useDeleteTimeEntry'
import { UpsertTimeEntryMode, useUpsertTimeEntry } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useUpsertTimeEntry'
import { useActiveTimeTracker, useActiveTimeTrackerGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useStartTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useStartTimeTracker'
import { useStopTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useStopTimeTracker'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Container } from '@components/Container/Container'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ActiveTimeTrackerActiveBanner } from '@components/TimeEntries/ActiveTimeTrackerBanner/ActiveTimeTrackerActiveBanner'
import { ActiveTimeTrackerStartDrawer } from '@components/TimeEntries/ActiveTimeTrackerBanner/ActiveTimeTrackerStartDrawer'

import './activeTimeTrackerBanner.scss'

const formatElapsedTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map(value => value.toString().padStart(2, '0'))
    .join(':')
}

const EMPTY_DURATION = formatElapsedTime(0)

interface ActiveTimeTrackerBannerProps {
  isDrawerOpen?: boolean
  onDrawerOpenChange?: (isOpen: boolean) => void
}

export const ActiveTimeTrackerBanner = ({ isDrawerOpen: externallyControlledIsDrawerOpen, onDrawerOpenChange }: ActiveTimeTrackerBannerProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const [internallyControlledIsDrawerOpen, setInternallyControlledIsDrawerOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [memo, setMemo] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const syncedActiveEntryIdRef = useRef<string | null>(null)

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

  useEffect(() => {
    if (!activeEntry) {
      syncedActiveEntryIdRef.current = null
      return
    }

    if (syncedActiveEntryIdRef.current === activeEntry.id) {
      return
    }

    syncedActiveEntryIdRef.current = activeEntry.id
    setSelectedServiceId(activeEntry.service?.id ?? null)
    setSelectedCustomer(activeEntry.customer ?? null)
    setMemo(activeEntry.memo ?? '')
  }, [activeEntry])

  useEffect(() => {
    if (!hasActiveTimer) {
      return
    }

    setNow(Date.now())

    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [hasActiveTimer])

  const elapsedSeconds = useMemo(() => {
    if (!activeEntry) {
      return 0
    }

    const createdAtTimestamp = activeEntry.createdAt.getTime()
    return Math.max(0, Math.floor((now - createdAtTimestamp) / 1000))
  }, [activeEntry, now])

  const timerDisplayValue = useMemo(
    () => formatElapsedTime(elapsedSeconds),
    [elapsedSeconds],
  )

  const startPayload = useMemo<StartTrackerEncoded | null>(() => {
    if (!selectedServiceId) {
      return null
    }

    return {
      service_id: selectedServiceId,
      billable: true,
      description: null,
      memo: memo.trim() || null,
      metadata: null,
      ...(selectedCustomer?.id && { customer_id: selectedCustomer.id }),
    }
  }, [memo, selectedCustomer?.id, selectedServiceId])

  const saveActiveTimerChanges = useCallback(async () => {
    if (!activeEntry || !selectedServiceId) {
      return
    }

    const selectedCustomerId = selectedCustomer?.id ?? null
    const activeCustomerId = activeEntry.customer?.id ?? null
    const memoValue = memo.trim() || null

    const hasChanges = selectedServiceId !== activeEntry.service?.id
      || selectedCustomerId !== activeCustomerId
      || memoValue !== (activeEntry.memo || null)

    if (hasChanges) {
      const updatePayload: Partial<UpsertTimeEntryEncoded> = {
        billable: activeEntry.billable,
        description: activeEntry.description ?? null,
        memo: memoValue,
        metadata: activeEntry.metadata ?? null,
        customer_id: selectedCustomerId,
        service_id: selectedServiceId,
      }

      await updateTimeEntry(updatePayload)
    }
  }, [activeEntry, memo, selectedCustomer?.id, selectedServiceId, updateTimeEntry])

  const saveActiveTimerChangesRef = useRef(saveActiveTimerChanges)
  saveActiveTimerChangesRef.current = saveActiveTimerChanges

  const handleDrawerOpenChange = useCallback((nextIsOpen: boolean) => {
    setIsDrawerOpen(nextIsOpen)
    if (!nextIsOpen) {
      setActionError(null)
    }
  }, [setIsDrawerOpen])

  useEffect(() => {
    if (!hasActiveTimer || !selectedServiceId) {
      return
    }

    let cancelled = false

    setActionError(null)
    void saveActiveTimerChangesRef.current().catch(() => {
      if (!cancelled) {
        setActionError(t('timeTracking:error.update_timer', 'Failed to update timer. Please try again.'))
      }
    })

    return () => {
      cancelled = true
    }
  }, [hasActiveTimer, memo, selectedCustomer?.id, selectedServiceId, t])

  useEffect(() => {
    if (hasActiveTimer && isDrawerOpen) {
      setIsDrawerOpen(false)
    }
  }, [hasActiveTimer, isDrawerOpen, setIsDrawerOpen])

  useEffect(() => {
    if (!hasActiveTimer) {
      setActionError(null)
    }
  }, [hasActiveTimer])

  const handleStartTimer = useCallback(async () => {
    if (!startPayload) {
      setActionError(t('timeTracking:validation.service_required', 'Service is a required field.'))
      return
    }

    setActionError(null)

    try {
      await startTimeTracker(startPayload)
      setSelectedCustomer(null)
      setSelectedServiceId(null)
      setMemo('')
      setIsDrawerOpen(false)
    }
    catch {
      setActionError(t('timeTracking:error.start_timer', 'Failed to start timer. Please try again.'))
    }
  }, [setIsDrawerOpen, startPayload, startTimeTracker, t])

  const handleCompleteTimer = useCallback(async () => {
    if (!activeEntry || !selectedServiceId) {
      return
    }

    setActionError(null)

    try {
      await saveActiveTimerChanges()
      await stopTimeTracker()
      setSelectedServiceId(null)
      setSelectedCustomer(null)
      setMemo('')
      setIsDrawerOpen(false)
    }
    catch {
      setActionError(t('timeTracking:error.update_timer', 'Failed to update timer. Please try again.'))
    }
  }, [activeEntry, selectedServiceId, saveActiveTimerChanges, setIsDrawerOpen, stopTimeTracker, t])

  const handleCancelTimer = useCallback(async () => {
    if (!activeEntry) {
      return
    }

    setActionError(null)

    try {
      await deleteTimeEntry()
      void invalidateActiveTimeTracker()
      setSelectedServiceId(null)
      setSelectedCustomer(null)
      setMemo('')
      setIsDrawerOpen(false)
    }
    catch {
      setActionError(t('timeTracking:error.cancel_timer', 'Failed to cancel timer. Please try again.'))
    }
  }, [activeEntry, deleteTimeEntry, invalidateActiveTimeTracker, setIsDrawerOpen, t])

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
      <Container name='ActiveTimeTrackerBanner'>
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
        <ActiveTimeTrackerActiveBanner
          actionError={actionError}
          timerDisplayValue={timerDisplayValue}
          selectedServiceId={selectedServiceId}
          onSelectedServiceIdChange={setSelectedServiceId}
          selectedCustomer={selectedCustomer}
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
          duration={EMPTY_DURATION}
          selectedServiceId={selectedServiceId}
          onSelectedServiceIdChange={setSelectedServiceId}
          selectedCustomer={selectedCustomer}
          onSelectedCustomerChange={setSelectedCustomer}
          memo={memo}
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
