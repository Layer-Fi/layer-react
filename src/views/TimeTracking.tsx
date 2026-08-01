import { useCallback, useMemo, useState } from 'react'
import { Briefcase, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useActiveTimeTracker } from '@api/businesses/[business-id]/time-tracking/tracker/active/get'
import { useGlobalDateRange } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { TimeTrackingServicesDrawerProvider, useTimeTrackingServicesDrawer } from '@providers/TimeTrackingServicesDrawerProvider/TimeTrackingServicesDrawerProvider'
import { type DropdownMenuItem } from '@ui/DropdownMenu/DropdownMenu'
import { DataTableHeaderMenu } from '@blocks/DataTable/DataTableHeaderMenu'
import { ActiveTimeTracker } from '@components/TimeEntries/ActiveTimeTracker/ActiveTimeTracker'
import { TimeEntries } from '@components/TimeEntries/TimeEntries'
import { TimeTrackingStats } from '@components/TimeTrackingStats/TimeTrackingStats'
import { View } from '@components/View/View'

export interface TimeTrackingStringOverrides {
  title?: string
}

export interface TimeTrackingProps {
  showTitle?: boolean
  onReportsClick?: () => void
  stringOverrides?: TimeTrackingStringOverrides
}

enum TimeTrackingHeaderMenuActions {
  Reports = 'Reports',
  Services = 'Services',
}

export const TimeTracking = ({ showTitle = true, onReportsClick, stringOverrides }: TimeTrackingProps) => {
  return (
    <TimeTrackingServicesDrawerProvider>
      <TimeTrackingContent showTitle={showTitle} onReportsClick={onReportsClick} stringOverrides={stringOverrides} />
    </TimeTrackingServicesDrawerProvider>
  )
}

const TimeTrackingContent = ({ showTitle, onReportsClick, stringOverrides }: TimeTrackingProps) => {
  const { t } = useTranslation()
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { data: activeTimeEntry, isLoading: isActiveTimeEntryLoading, isError: isActiveTimeEntryError } = useActiveTimeTracker()
  const { openServicesDrawer } = useTimeTrackingServicesDrawer()
  const [isActiveTimerDrawerOpen, setIsActiveTimerDrawerOpen] = useState(false)

  const globalDateFilterParams = useMemo(
    () => ({ startDate, endDate }),
    [endDate, startDate],
  )

  const onStartTimer = useCallback(() => {
    setIsActiveTimerDrawerOpen(true)
  }, [])

  const menuItems = useMemo<DropdownMenuItem[]>(() => [
    ...(onReportsClick
      ? [{
        key: TimeTrackingHeaderMenuActions.Reports,
        onClick: onReportsClick,
        slots: { Icon: FileText },
        label: t('reports:label.reports', 'Reports'),
      }]
      : []),
    {
      key: TimeTrackingHeaderMenuActions.Services,
      onClick: openServicesDrawer,
      slots: { Icon: Briefcase },
      label: t('timeTracking:services.title', 'Services'),
    },
  ], [openServicesDrawer, t, onReportsClick])

  return (
    <View
      title={stringOverrides?.title || t('timeTracking:label.time_tracking', 'Time Tracking')}
      showHeader={showTitle}
      header={(
        <DataTableHeaderMenu
          ariaLabel={t('timeTracking:label.additional_time_tracking_actions', 'Additional time tracking actions')}
          items={menuItems}
        />
      )}
    >
      <ActiveTimeTracker
        isDrawerOpen={isActiveTimerDrawerOpen}
        onDrawerOpenChange={setIsActiveTimerDrawerOpen}
      />
      <TimeTrackingStats selectedFilterParams={globalDateFilterParams} />
      <TimeEntries
        filterParams={globalDateFilterParams}
        onStartTimer={onStartTimer}
        isStartTimerDisabled={isActiveTimeEntryLoading || isActiveTimeEntryError || activeTimeEntry !== null}
      />
    </View>
  )
}
