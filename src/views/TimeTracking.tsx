import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useActiveTimeTracker } from '@hooks/api/businesses/[business-id]/time-tracking/tracker/useActiveTimeTracker'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { ActiveTimeTracker } from '@components/TimeEntries/ActiveTimeTracker/ActiveTimeTracker'
import { TimeEntries } from '@components/TimeEntries/TimeEntries'
import { TimeTrackingServicesDrawer } from '@components/TimeEntries/TimeTrackingServicesDrawer/TimeTrackingServicesDrawer'
import { TimeTrackingStats } from '@components/TimeTrackingStats/TimeTrackingStats'
import { View } from '@components/View/View'

export type UnstableTimeTrackingProps = {
  showTitle?: boolean
  onReportsClick?: () => void
}

export const unstable_TimeTracking = ({ showTitle = true, onReportsClick }: UnstableTimeTrackingProps) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode: 'full' })
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: activeTimeEntry, isLoading: isActiveTimeEntryLoading } = useActiveTimeTracker()
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isActiveTimerDrawerOpen, setIsActiveTimerDrawerOpen] = useState(false)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [isServicesDrawerOpen, setIsServicesDrawerOpen] = useState(false)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const summaryFilterParams = useMemo(
    () => ({ startDate, endDate }),
    [endDate, startDate],
  )

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const onStartTimer = useCallback(() => {
    setIsActiveTimerDrawerOpen(true)
  }, [])

  return (
    <View
      title={t('timeTracking:label.time_tracking', 'Time Tracking')}
      showHeader={showTitle}
      header={(
        <HStack gap='sm' align='center' justify='end'>
          {onReportsClick !== undefined && (
            <Button variant='outlined' onPress={onReportsClick}>
              {t('reports:label.reports', 'Reports')}
            </Button>
          )}
          <Button variant='outlined' onPress={() => setIsServicesDrawerOpen(true)}>
            {t('timeTracking:services.title', 'Services')}
          </Button>
        </HStack>
      )}
    >
      <ActiveTimeTracker
        isDrawerOpen={isActiveTimerDrawerOpen}
        onDrawerOpenChange={setIsActiveTimerDrawerOpen}
      />
      <TimeTrackingStats selectedFilterParams={summaryFilterParams} />
      <TimeEntries
        onStartTimer={onStartTimer}
        isStartTimerDisabled={isActiveTimeEntryLoading || activeTimeEntry !== null}
      />
      <TimeTrackingServicesDrawer isOpen={isServicesDrawerOpen} onOpenChange={setIsServicesDrawerOpen} />
    </View>
  )
}
