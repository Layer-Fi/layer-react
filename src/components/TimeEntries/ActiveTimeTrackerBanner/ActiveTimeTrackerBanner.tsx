import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { type Customer } from '@schemas/customer'
import { type StartTrackerEncoded, type UpsertTimeEntryEncoded } from '@schemas/timeTracking'
import { useDeleteTimeEntry } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/[time-entry-id]/useDeleteTimeEntry'
import { UpsertTimeEntryMode, useUpsertTimeEntry } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/useUpsertTimeEntry'
import { useActiveTimeTracker, useActiveTimeTrackerGlobalCacheActions } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useStartTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useStartTimeTracker'
import { useStopTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useStopTimeTracker'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { TextField } from '@ui/Form/Form'
import { TextArea } from '@ui/Input/TextArea'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { CustomerSelector } from '@components/CustomerSelector/CustomerSelector'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TimeEntryServiceSelector } from '@components/TimeEntries/TimeEntryServiceSelector/TimeEntryServiceSelector'

import './activeTimeTrackerBanner.scss'

const ActiveTimeTrackerDrawerHeader = ({ title, close, isMobile }: { title: string, close: () => void, isMobile: boolean }) => (
  <ModalTitleWithClose
    heading={<ModalHeading size='md'>{title}</ModalHeading>}
    onClose={close}
    hideBottomPadding={isMobile}
  />
)

const formatElapsedTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map(value => value.toString().padStart(2, '0'))
    .join(':')
}

const ActiveTimerDurationDisplay = ({ duration }: { duration: string }) => {
  const { t } = useTranslation()

  return (
    <VStack className='Layer__ActiveTimeTrackerBanner__DurationDisplay' align='center' gap='2xs'>
      <Span className='Layer__ActiveTimeTrackerBanner__DurationValue'>{duration}</Span>
      <Span className='Layer__ActiveTimeTrackerBanner__DurationLabel' size='xs' weight='bold'>
        {t('timeTracking:label.duration', 'Duration')}
      </Span>
    </VStack>
  )
}

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
      return
    }

    setSelectedServiceId(activeEntry.service?.id ?? null)
    setSelectedCustomer(activeEntry.customer ?? null)
    setMemo(activeEntry.memo ?? '')
  }, [activeEntry])

  useEffect(() => {
    if (!activeEntry) {
      return
    }

    setNow(Date.now())

    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [activeEntry])

  const elapsedSeconds = useMemo(() => {
    if (!activeEntry) {
      return 0
    }

    const createdAtTimestamp = activeEntry.createdAt.getTime()
    return Math.max(0, Math.floor((now - createdAtTimestamp) / 1000))
  }, [activeEntry, now])

  const elapsedTime = useMemo(
    () => formatElapsedTime(elapsedSeconds),
    [elapsedSeconds],
  )
  const timerDisplayValue = elapsedTime

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
        <Container name='ActiveTimeTrackerBanner'>
          {actionError && (
            <VStack pi='md' pbe='2xs'>
              <DataState
                status={DataStateStatus.failed}
                title={actionError}
                inline
              />
            </VStack>
          )}

          <HStack className='Layer__ActiveTimeTrackerBanner__Main' gap='md' justify='space-between' align='center'>
            <HStack className='Layer__ActiveTimeTrackerBanner__Controls' gap='sm' align='center'>
              <HStack className='Layer__ActiveTimeTrackerBanner__Timer' gap='sm' align='center'>
                <Span className='Layer__ActiveTimeTrackerBanner__TimerDot' />
                <Span className='Layer__ActiveTimeTrackerBanner__TimerValue'>{timerDisplayValue}</Span>
              </HStack>

              <HStack className='Layer__ActiveTimeTrackerBanner__InlineFields' gap='sm' align='center'>
                <TimeEntryServiceSelector
                  selectedServiceId={selectedServiceId}
                  onSelectedServiceIdChange={setSelectedServiceId}
                  inline
                  showLabel={false}
                  className='Layer__ActiveTimeTrackerBanner__Field__Service Layer__ActiveTimeTrackerBanner__Field--inline'
                />

                <CustomerSelector
                  selectedCustomer={selectedCustomer}
                  onSelectedCustomerChange={setSelectedCustomer}
                  inline
                  showLabel={false}
                  placeholder={t('timeTracking:label.select_customer', 'Select a customer (optional)')}
                  className='Layer__ActiveTimeTrackerBanner__Field__Customer Layer__ActiveTimeTrackerBanner__Field--inline'
                />
              </HStack>
            </HStack>

            <HStack className='Layer__ActiveTimeTrackerBanner__Actions' gap='sm' align='center'>
              <Button
                variant='text'
                onPress={() => { void handleCancelTimer() }}
                isPending={isCancelling}
                isDisabled={isStopping || isUpdating}
              >
                {t('timeTracking:action.cancel_timer', 'Cancel')}
              </Button>

              <HStack className='Layer__ActiveTimeTrackerBanner__CompleteButton'>
                <Button
                  variant='outlined'
                  onPress={() => { void handleCompleteTimer() }}
                  isPending={isStopping || isUpdating}
                  isDisabled={isCancelling || !selectedServiceId}
                >
                  {t('timeTracking:action.complete_timer', 'Complete')}
                  <Check size={16} />
                </Button>
              </HStack>
            </HStack>
          </HStack>
        </Container>
      )}

      {!hasActiveTimer && (
        <Drawer
          isOpen={isDrawerOpen}
          onOpenChange={handleDrawerOpenChange}
          isDismissable
          variant={isMobile ? 'mobile-drawer' : 'drawer'}
          flexBlock={isMobile}
          aria-label={t('timeTracking:action.start_timer', 'Start Timer')}
          slots={{
            Header: ({ close }) => (
              <ActiveTimeTrackerDrawerHeader
                title={t('timeTracking:action.start_timer', 'Start Timer')}
                close={close}
                isMobile={isMobile}
              />
            ),
          }}
        >
          <VStack className='Layer__ActiveTimeTrackerBanner__DrawerContent' gap='md'>
            {actionError && (
              <DataState
                status={DataStateStatus.failed}
                title={actionError}
                inline
              />
            )}

            <ActiveTimerDurationDisplay duration={formatElapsedTime(0)} />

            <VStack gap='md'>
              <TimeEntryServiceSelector
                selectedServiceId={selectedServiceId}
                onSelectedServiceIdChange={setSelectedServiceId}
                inline
                className='Layer__ActiveTimeTrackerBanner__Field__Service'
              />

              <CustomerSelector
                selectedCustomer={selectedCustomer}
                onSelectedCustomerChange={setSelectedCustomer}
                inline
                placeholder={t('timeTracking:label.select_customer', 'Select a customer (optional)')}
                className='Layer__ActiveTimeTrackerBanner__Field__Customer'
              />

              <TextField
                name='active-time-tracker-memo'
                inline
                textarea
                className='Layer__ActiveTimeTrackerBanner__Field__Memo'
              >
                <Label slot='label' size='sm' htmlFor='active-time-tracker-memo'>
                  {t('timeTracking:label.memo', 'Memo')}
                </Label>
                <TextArea
                  slot='input'
                  id='active-time-tracker-memo'
                  name='active-time-tracker-memo'
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder={t('timeTracking:label.add_memo', 'Add memo')}
                />
              </TextField>

              <HStack pie='lg' gap='xs' justify='end' pbs='sm'>
                <Button
                  onPress={() => { void handleStartTimer() }}
                  isPending={isStarting}
                  isDisabled={!startPayload || isStopping || isCancelling}
                >
                  <Play size={16} />
                  {t('timeTracking:action.start_timer', 'Start Timer')}
                </Button>
              </HStack>
            </VStack>
          </VStack>
        </Drawer>
      )}
    </>
  )
}
