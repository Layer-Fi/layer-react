import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/api/apiError'
import { useGetActiveTimeTracker } from '@api/businesses/[business-id]/time-tracking/tracker/active/get'
import { useElapsedSeconds } from '@hooks/utils/dates/useElapsedSeconds'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { VStack } from '@ui/Stack/Stack'
import { Container } from '@components/Container/Container'
import { ActiveTimeTrackerBanner } from '@components/TimeEntries/ActiveTimeTracker/ActiveTimeTrackerBanner'
import { ActiveTimeTrackerStartDrawer } from '@components/TimeEntries/ActiveTimeTracker/ActiveTimeTrackerStartDrawer'

import './activeTimeTracker.scss'

interface ActiveTimeTrackerProps {
  isDrawerOpen: boolean
  onDrawerOpenChange: (isOpen: boolean) => void
}

export const ActiveTimeTracker = ({ isDrawerOpen, onDrawerOpenChange }: ActiveTimeTrackerProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const { formatSecondsAsDuration } = useIntlFormatter()

  const { data: activeEntry, isLoading, isError, error } = useGetActiveTimeTracker()

  const elapsedSeconds = useElapsedSeconds(activeEntry?.createdAt)
  const timerDisplayValue = useMemo(
    () => formatSecondsAsDuration(elapsedSeconds),
    [elapsedSeconds, formatSecondsAsDuration],
  )

  if (isLoading) {
    return null
  }

  if (isError) {
    if (isAPIErrorOfType(error, ApiEnumErrorType.SpecifiedIdNotFound)) {
      return null
    }

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
      onOpenChange={onDrawerOpenChange}
      isMobile={isMobile}
    />
  )
}
