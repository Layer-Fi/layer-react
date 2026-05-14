import { useMemo } from 'react'

import { useActiveTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useElapsedSeconds } from '@hooks/utils/dates/useElapsedSeconds'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ActiveTimeTrackerBanner } from '@components/TimeEntries/ActiveTimeTracker/ActiveTimeTrackerBanner'
import { ActiveTimeTrackerStartDrawer } from '@components/TimeEntries/ActiveTimeTracker/ActiveTimeTrackerStartDrawer'

import './activeTimeTracker.scss'

interface ActiveTimeTrackerProps {
  isDrawerOpen: boolean
  onDrawerOpenChange: (isOpen: boolean) => void
}

export const ActiveTimeTracker = ({ isDrawerOpen, onDrawerOpenChange }: ActiveTimeTrackerProps) => {
  const { isMobile } = useSizeClass()
  const { formatSecondsAsDuration } = useIntlFormatter()

  const { data: activeEntry, isLoading, isError } = useActiveTimeTracker()

  const elapsedSeconds = useElapsedSeconds(activeEntry?.createdAt)
  const timerDisplayValue = useMemo(
    () => formatSecondsAsDuration(elapsedSeconds),
    [elapsedSeconds, formatSecondsAsDuration],
  )

  if (isLoading) {
    return null
  }

  if (isError) {
    return null
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
