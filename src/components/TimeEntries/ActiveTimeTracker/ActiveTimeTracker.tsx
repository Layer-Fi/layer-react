import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useActiveTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
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

  const { data: activeEntry, isLoading, isError } = useActiveTimeTracker()

  const isDrawerOpen = externallyControlledIsDrawerOpen ?? internallyControlledIsDrawerOpen

  const setIsDrawerOpen = useCallback((isOpen: boolean) => {
    if (externallyControlledIsDrawerOpen === undefined) {
      setInternallyControlledIsDrawerOpen(isOpen)
    }

    onDrawerOpenChange?.(isOpen)
  }, [externallyControlledIsDrawerOpen, onDrawerOpenChange])

  const elapsedSeconds = useElapsedSeconds(activeEntry?.createdAt)
  const timerDisplayValue = useMemo(
    () => formatSecondsAsDuration(elapsedSeconds),
    [elapsedSeconds, formatSecondsAsDuration],
  )

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

  if (activeEntry) {
    return (
      <ActiveTimeTrackerBanner
        activeEntry={activeEntry}
        timerDisplayValue={timerDisplayValue}
      />
    )
  }

  return (
    <ActiveTimeTrackerStartDrawer
      isOpen={isDrawerOpen}
      onOpenChange={setIsDrawerOpen}
      isMobile={isMobile}
    />
  )
}
